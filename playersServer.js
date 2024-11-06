const enemyManager = require('./enemyManager');
const players = {}; // Хранит информацию об игроках
const { initializePlayerAttributes, updateAttributes } = require('./playerAttributes');
const { clearOverlayMap } = require('./overlayMapServer'); // Импортируем функцию очистки overlay
const { clearMap } = require('./mapServer');
const playersByRoom = {};

module.exports = (socket, io) => {

    socket.on('joinRoom', ({ roomName, playerName }) => {
        if (!playersByRoom[roomName]) playersByRoom[roomName] = {};
        playersByRoom[roomName][socket.id] = { name: playerName, position: { x: 50, y: 50 } };
        
        socket.join(roomName);
        io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);
    });

    socket.on('requestPlayerAttributes', ({ roomName }) => {
        if (players[roomName] && players[roomName][socket.id]) {
            socket.emit('playerAttributes', players[roomName][socket.id].attributes);
        }
    });

    socket.on('updateAttributes', ({ roomName, newAttributes }) => {
        if (players[roomName] && players[roomName][socket.id]) {
            updateAttributes(players[roomName][socket.id].attributes, newAttributes);
            io.to(roomName).emit('updatePlayers', players[roomName]);
            enemyManager.updateEnemyTargets(roomName, position);
        }
    });

    socket.on('updatePosition', ({ roomName, position }) => {
        if (playersByRoom[roomName] && playersByRoom[roomName][socket.id]) {
            playersByRoom[roomName][socket.id].position = position;
            io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);
        }
    });

  socket.on('disconnect', () => {
        for (const roomName in playersByRoom) {
            if (playersByRoom[roomName][socket.id]) {
                delete playersByRoom[roomName][socket.id];
                io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);
                
                if (Object.keys(playersByRoom[roomName]).length === 0) {
                    delete playersByRoom[roomName];
                    console.log(`Room ${roomName} is now empty.`);
                }
            }
        }
    });
};
