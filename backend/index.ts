import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let pixelData: Array<{ x: number, y: number }> = [];


const updatePixelData = (x: number, y: number) => {
    pixelData.push({ x, y });
};

wss.on('connection', (ws: WebSocket) => {
    console.log('Новый клиент подключился');

    ws.send(JSON.stringify(pixelData));

    ws.on('message', (message: any) => {
        const data = JSON.parse(message);
        updatePixelData(data.x, data.y);
        const updatedPixelData = JSON.stringify(pixelData);

        wss.clients.forEach((client: WebSocket) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(updatedPixelData); // Отправляем полный список пикселей
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
