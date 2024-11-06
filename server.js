// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const handleLobby = require('./lobbyServer');
const playersServer = require('./playersServer');
const playerResourcesServer = require('./playerResourcesServer');
const roomTimerServer = require('./roomTimerServer');
const buildingManager = require('./buildingCheck');
const playerAttributes = require('./playerAttributes');
const enemyManager = require('./enemyManager');

const handleMap = require('./mapServer');
const { format } = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    handleLobby(socket, io);
    playersServer(io);
    playerResourcesServer(io);
    roomTimerServer(io);
    handleMap(socket, io);
    socket.on('startGame', () => {
        console.log("Game started, initializing enemy manager...");
        enemyManager.initializeEnemyManager(io);
    });
    playerAttributes.handleAttributes(socket);
    buildingManager.handleBuilding(socket, io);
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
