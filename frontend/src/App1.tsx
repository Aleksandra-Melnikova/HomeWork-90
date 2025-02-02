import { useEffect, useRef, useState } from "react";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#000000");
  const ws = useRef<WebSocket | null>(null);
  let isDrawing: boolean = false;

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/canvas");
    ws.current.onopen = (): void => {
      console.log("Подключено к серверу");
    };
    ws.current.onmessage = (event: MessageEvent): void => {
      const data: { x: number; y: number; color: string }[] = JSON.parse(
        event.data,
      );
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 1000, 1000);
        data.forEach((pixel) => {
          ctx.fillStyle = pixel.color;
          ctx.fillRect(pixel.x, pixel.y, 1, 1);
        });
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing = true;
    draw(event);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const x = event.nativeEvent.offsetX;
      const y = event.nativeEvent.offsetY;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);

      if (ws.current) {
        ws.current.send(JSON.stringify({ x, y, color }));
      }
    }
  };

  const stopDrawing = () => {
    isDrawing = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
      }
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value); // Изменяем состояние цвета
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: "20px" }} htmlFor="color">
          Выберите цвет
        </label>
        <input
          style={{ margin: "20px", width: "100px", height: "50px" }}
          id="color"
          type="color"
          value={color}
          onChange={handleColorChange} // Обработчик изменения цвета
        />
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          style={{ border: "1px solid #000" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
    </div>
  );
};

export default App;
