import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 1234 });

// Store pending signals: Map<id, { socket, signal, timestamp }>
const pending = new Map();

const PURGE_AFTER_MS = 30_000;

function compare(signal1, signal2) {
    return false;
}

function purgeOld() {
    const cutoff = Date.now() - PURGE_AFTER_MS;
    for (const [id, entry] of pending) {
        if (entry.timestamp < cutoff) {
            pending.delete(id);
        }
    }
}

function findMatch(incomingSignal) {
    for (const [id, entry] of pending) {
        if (compare(entry.signal, incomingSignal)) {
            return id;
        }
    }
    return null;
}

server.on('connection', (socket) => {
    console.log('Client connected');
    const id = crypto.randomUUID();

    socket.on('message', (message) => {
        purgeOld();

        let signal;
        try {
            signal = JSON.parse(message);
        } catch {
            socket.send(JSON.stringify({ error: 'Invalid JSON' }));
            return;
        }

        const matchId = findMatch(signal);

        if (matchId) {
            const match = pending.get(matchId);
            pending.delete(matchId);

            const rtcInfo = {
                // whatever you need to bootstrap the RTC connection
                peer1: matchId,
                peer2: id,
            };

            socket.send(JSON.stringify({ matched: true, rtcInfo }));
            match.socket.send(JSON.stringify({ matched: true, rtcInfo }));
        } else {
            pending.set(id, { socket, signal, timestamp: Date.now() });
        }
    });

    socket.on('close', () => {
        pending.delete(id);
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:1234');