import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

export interface IncomingMessage {
    type: string;
    payload: string;
}


const router = express.Router();
const connectionClients: WebSocket[] = [];

router.ws('/chat',  (ws, req) => {
    connectionClients.push(ws);
    console.log('client connected! Client total - ', connectionClients.length);

    let username = 'Anonymous';
    ws.on('message', (message) => {
        try {
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

            if( decodedMessage.type === 'SET_USERNAME' ) {
                username = decodedMessage.payload;
            } else if (decodedMessage.type === 'SEND_MESSAGE'){
                connectionClients.forEach((clientWS) => {
                    clientWS.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        payload: {
                            username: username,
                            text: decodedMessage.payload,
                        },
                    }));
                });
            }
        }
        catch (e) {
            ws.send(JSON.stringify({error: "Invalid message format"}));
        }

    })

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