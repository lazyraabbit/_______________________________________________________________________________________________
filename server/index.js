const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this demo
        methods: ["GET", "POST"]
    }
});

const messages = []; // In-memory storage

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Send existing history to the new user
    socket.emit('load_messages', messages);

    socket.on('send_message', (data) => {
        // Save to history
        messages.push(data);

        // Broadcast to everyone else (or everyone including sender, depending on client logic)
        // For simplicity, let's broadcast to everyone so the sender sees it confirm via server
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
