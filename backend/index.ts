import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());


const router = express.Router();
const connectionClients: WebSocket[] = [];
let pixelData: Array<{ x: number, y: number }> = [];

router.ws('/canvas',  (ws, req) => {
    connectionClients.push(ws);
    console.log('client connected! Client total - ', connectionClients.length);
    if(connectionClients.length === 1){
       pixelData = [];
    }
        ws.send(JSON.stringify(pixelData));

        ws.on('message', (message: any) => {
            try{
                const data = JSON.parse(message);
                pixelData.push({ x: data.x, y: data.y });

                const updatedPixelData = JSON.stringify(pixelData);

                connectionClients.forEach((client: WebSocket) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(updatedPixelData);
                    }
                });
            }
            catch (e) {
                ws.send(JSON.stringify({error: "Invalid message format"}));
            }
        });

    ws.on('close', () => {
        console.log('client disconnected!');
        const index = connectionClients.indexOf(ws);
        connectionClients.splice(index, 1);
    });
    });

app.use(router);

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});