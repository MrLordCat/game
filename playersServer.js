const enemyManager = require('./enemyManager');
const players = {}; // Хранит информацию об игроках
const { initializePlayerAttributes, updateAttributes } = require('./playerAttributes');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Player connected: ${socket.id}`);

        socket.on('joinRoom', ({ roomName, playerName }) => {
            if (!players[roomName]) players[roomName] = {};
            players[roomName][socket.id] = {
                name: playerName,
                position: { x: 50, y: 50 },
                attributes: initializePlayerAttributes()
            };

            socket.join(roomName);
            io.to(roomName).emit('updatePlayers', players[roomName]);
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
            enemyManager.updateEnemyTargets(position);
            if (players[roomName] && players[roomName][socket.id]) {
                players[roomName][socket.id].position = position;
                io.to(roomName).emit('updatePlayers', players[roomName]);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);
            for (const roomName in players) {
                if (players[roomName][socket.id]) {
                    delete players[roomName][socket.id];
                    io.to(roomName).emit('updatePlayers', players[roomName]);
                }
            }
        });
    });
};
