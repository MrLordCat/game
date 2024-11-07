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
const { handlePlayerMovement, updateMapData } = require('./playerMovementServer'); 
const overlayMapServer = require('./overlayMapServer'); 
const { updateEnemyTargets } = require('./enemyManager');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const activeSockets = {}; 
app.use(express.static('public'));

// Функция для обновления карты в модуле передвижения
function updatePlayerMovementMap(newMap) {
    updateMapData(newMap);
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    activeSockets[socket.id] = socket;
    handleLobby(socket, io);
    handleMap(socket, io, updatePlayerMovementMap); // Передаем функцию для обновления карты
    handlePlayerMovement(socket, io, updateEnemyTargets); // Подключаем обработчик передвижения
    socket.on('setTargetPosition', (targetPosition) => {
        const player = { x: targetPosition.x, y: targetPosition.y };
        enemyManager.updateEnemyTargets(player); // Обновляем цель для врагов
    });
    playersServer(socket, io);
    playerResourcesServer.handlePlayerResources(socket);
    roomTimerServer(io, socket); 
    playerAttributes.handleAttributes(socket);
    buildingManager.handleBuilding(socket, io);
    overlayMapServer(socket, io); 
    socket.on('startGame', ({ roomName }) => {
        console.log(`Game started in room ${roomName}, initializing enemy manager...`);
        enemyManager.initializeEnemyManager(io, roomName);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        // Удаляем игрока из activeSockets
        delete activeSockets[socket.id];
        // Очищаем все слушатели и зависимости
        socket.removeAllListeners();

    });
});

setInterval(() => {
    console.log("Active Sockets:", Object.keys(activeSockets));
}, 60000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
