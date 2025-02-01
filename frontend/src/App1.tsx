// import React, { useRef, useState, useEffect } from 'react';

import {useEffect, useRef, useState} from "react";

const App: React.FC = () => {
//     // Получаем элементы канваса и контекста рисования
//     const canvas = document.getElementById('canvas') as HTMLCanvasElement;
//     const ctx = canvas.getContext('2d');
//
// // Настройки рисования
//     let isDrawing: boolean = false;
//     let lastX: number = 0;
//     let lastY: number = 0;
//
// // Цвет рисования
//     const drawColor: string = 'black';  // Можно добавить выбор цвета позже
//
// // WebSocket клиент
//     const socket: WebSocket = new WebSocket('ws://localhost:3000');
//
// // Получение данных о пикселях с сервера при подключении
//     socket.onopen = (): void => {
//         console.log('Подключено к серверу');
//     };
//
// // Обработчик получения данных от сервера (для синхронизации с другими клиентами)
//     socket.onmessage = (event: MessageEvent): void => {
//         const data: { x: number, y: number, color: string }[] = JSON.parse(event.data);
//         data.forEach((pixel: { x: number, y: number, color: string }) => {
//             drawPixel(pixel.x, pixel.y, pixel.color);
//         });
//     };
//
// // Функция для рисования пикселя
//     function drawPixel(x: number, y: number, color: string): void {
//         if(ctx){
//             ctx.fillStyle = color;
//             ctx.fillRect(x, y, 1, 1);
//         }
//          // Рисуем маленький пиксель размером 1x1
//     }
//
// // Функция для начала рисования
//     canvas.addEventListener('mousedown', (e: MouseEvent): void => {
//         isDrawing = true;
//         lastX = e.offsetX;
//         lastY = e.offsetY;
//         drawPixel(lastX, lastY, drawColor);
//
//         // Отправляем первый пиксель на сервер
//         socket.send(JSON.stringify({ x: lastX, y: lastY, color: drawColor }));
//     });
//
// // Окончание рисования
//     canvas.addEventListener('mouseup', (): void => {
//         isDrawing = false;
//     });
//
// // Отслеживание движения мыши для рисования
//     canvas.addEventListener('mousemove', (e: MouseEvent): void => {
//         if (!isDrawing) return;
//
//         const x: number = e.offsetX;
//         const y: number = e.offsetY;
//
//         drawPixel(x, y, drawColor);
//
//         // Отправляем данные о рисовании на сервер
//         socket.send(JSON.stringify({ x, y, color: drawColor }));
//     });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // const [isDrawing, setIsDrawing] = useState(false);
    const socket = useRef<WebSocket | null>(null);
    const [usernameText, setUsernameText] = useState("");
    const [isLoggedIn, setLoggedIn] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    let isDrawing: boolean = false;
    let lastX: number = 0;
    let lastY: number = 0;



    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:8000/chat');
        socket.current.onopen = (): void => {
        console.log('Подключено к серверу');
    };
        socket.current.onmessage = (event: MessageEvent): void => {
        const data: { x: number, y: number, color: string }[] = JSON.parse(event.data);

        data.forEach((pixel: { x: number, y: number, color: string }) => {
            drawPixel(pixel.x, pixel.y);
        });


    };
        function drawPixel(x: number, y: number): void {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if(ctx){
                ctx.fillRect(x, y, 1, 1);
            }
            // Рисуем маленький пиксель размером 1x1
        }
        const canvas = canvasRef.current;
        canvas?.addEventListener('mousedown', (e: MouseEvent): void => {
        isDrawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
        drawPixel(lastX, lastY);

        // Отправляем первый пиксель на сервер
            socket.current?.send(JSON.stringify({ x: lastX, y: lastY,}))
    });
        canvasRef.current?.addEventListener('mouseup', (): void => {
        isDrawing = false;
    });

        canvasRef.current?.addEventListener('mousemove', (e: MouseEvent): void => {
        if (!isDrawing) return;

        const x: number = e.offsetX;
        const y: number = e.offsetY;

        drawPixel(x, y);
        socket.current?.send(JSON.stringify({ x, y}));
    });

        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);

    const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsernameText(e.target.value);
    };

    const sendWSUsername = (e: React.FormEvent) => {
      e.preventDefault();
      if (!ws.current) return;
      ws.current.send(JSON.stringify({
        type: 'SET_USERNAME',
        payload: usernameText
      }));

      setLoggedIn(true);
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
     isDrawing = true;
        draw(event);
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const x = event.nativeEvent.offsetX;
            const y = event.nativeEvent.offsetY;
            ctx.lineTo(x, y);
            ctx.stroke();

            if (socket.current) {
                socket.current.send(JSON.stringify({ x, y }));
            }
        }
    };

    const stopDrawing = () => {
       isDrawing = false;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
            }
        }
    };

    return (<>

    {!isLoggedIn ? <>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f4f4f4'
        }}>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                style={{border: '1px solid #000'}}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
        </div>
    </> :<> <h4>Log in</h4>
        <form onSubmit={sendWSUsername}>
    <input type="text" value={usernameText} onChange={changeUsername}/>
    <button type="submit">Log in</button>
    </form></>
}
</>
)
    ;
};

export default App;
