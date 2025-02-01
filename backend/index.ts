import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const canvasWidth = 800;
const canvasHeight = 600;

let pixelData: Array<{ x: number, y: number, color: string }> = [];


const updatePixelData = (x: number, y: number, color: string) => {
    pixelData.push({ x, y, color });
};

wss.on('connection', (ws: WebSocket) => {
    console.log('Новый клиент подключился');

    ws.send(JSON.stringify(pixelData));

    ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        updatePixelData(data.x, data.y, data.color);

        wss.clients.forEach((client: WebSocket) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

const port = 8000;
server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
