const enemyManager = require('./enemyManager');
const players = {}; // Хранит информацию об игроках
const { initializePlayerAttributes, updateAttributes } = require('./playerAttributes');
const { clearOverlayMap } = require('./overlayMapServer'); // Импортируем функцию очистки overlay
const { clearMap } = require('./mapServer');

module.exports = (socket, io) => {

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
        for (const roomName in players) {
            if (players[roomName][socket.id]) {
                delete players[roomName][socket.id];
    
                // Проверка, пуста ли комната после удаления игрока
                if (Object.keys(players[roomName]).length === 0) {
                    delete players[roomName];
                    io.to(roomName).emit('roomClosed'); // Можно отправить уведомление об удалении комнаты
                    console.log(`Room ${roomName} is now empty and has been deleted.`);
                } else {
                    io.to(roomName).emit('updatePlayers', players[roomName]);
                }
            }
        }
    });
};
