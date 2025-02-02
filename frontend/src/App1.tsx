import { useEffect, useRef } from "react";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  let isDrawing: boolean = false;

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/canvas");
    ws.current.onopen = (): void => {
      console.log("Подключено к серверу");
    };
    ws.current.onmessage = (event: MessageEvent): void => {
      const data: { x: number; y: number }[] = JSON.parse(event.data);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 1000, 1000);
        data.forEach((pixel: { x: number; y: number }) => {
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
      ctx.lineTo(x, y);
      ctx.stroke();

      if (ws.current) {
        ws.current.send(JSON.stringify({ x, y }));
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
  );
};

export default App;
