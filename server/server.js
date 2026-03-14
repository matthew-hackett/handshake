import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ 
  port: 1234 
});

function compare(signal1, signal2) {
    return false;
}

// TODO:
// - store previous
// - on new ones, check with previous
// - purge old ones
// - if successful, send a successful message to each with the rtc connection info

server.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        console.log(`Received: ${message}`);
        socket.send(`Server: ${message}`);
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:1234');