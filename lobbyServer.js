// lobbyServer.js

const rooms = {};
const players = {};

function handleLobby(socket, io) {
    socket.on('createRoom', ({ roomName, playerName }) => {
        console.log(`Request to create room: ${roomName}`);
        if (!rooms[roomName]) {
            rooms[roomName] = { players: [], readyCount: 0 };
            socket.join(roomName);
            rooms[roomName].players.push({ id: socket.id, name: playerName, isReady: false });
            console.log(`Room ${roomName} created by ${playerName} (${socket.id})`);
            socket.emit('roomCreated', roomName);
    
            // Добавляем игрока в players для синхронизации с картой
            if (!players[roomName]) players[roomName] = {};
            players[roomName][socket.id] = {
                name: playerName,
                position: { x: 50, y: 50 }
            };
            io.to(roomName).emit('playerJoined', rooms[roomName].players);
            io.to(roomName).emit('updatePlayers', players[roomName]); // Обновляем всех игроков
        } else {
            socket.emit('error', 'Room already exists');
        }
    });
    
    
    socket.on('joinRoom', ({ roomName, playerName }) => {
        console.log(`Request to join room: ${roomName} as ${playerName}`);
        if (rooms[roomName] && rooms[roomName].players.length < 4) {
            socket.join(roomName);
            rooms[roomName].players.push({ id: socket.id, name: playerName, isReady: false });
            console.log(`Player ${playerName} (${socket.id}) joined room ${roomName}`);
    
            // Добавляем игрока в players для синхронизации с картой
            if (!players[roomName]) players[roomName] = {};
            players[roomName][socket.id] = {
                name: playerName,
                position: { x: 50, y: 50 }
            };
            io.to(roomName).emit('playerJoined', rooms[roomName].players);
            io.to(roomName).emit('updatePlayers', players[roomName]); // Обновляем всех игроков
        } else {
            socket.emit('error', 'Room is full or does not exist');
        }
    });
    socket.on('leaveRoom', ({ roomName }) => {
        const room = rooms[roomName];
        if (room) {
            // Удаляем игрока из списка игроков в комнате
            room.players = room.players.filter(p => p.id !== socket.id);
            delete players[roomName][socket.id];
            socket.leave(roomName);

            // Проверяем, если в комнате больше нет игроков, удаляем комнату
            if (room.players.length === 0) {
                delete rooms[roomName];
                io.to(roomName).emit('roomClosed');
            } else {
                io.to(roomName).emit('playerLeft', { playerId: socket.id });
                io.to(roomName).emit('updatePlayers', players[roomName]);
            }
        }
    });
    

    socket.on('playerReady', () => {
        const room = getRoomByPlayer(socket.id);
        if (room) {
            console.log(`Player ${socket.id} in room ${room.name} is setting ready status.`);
            const player = room.players.find(p => p.id === socket.id);
    
            if (player) {
                console.log(`Found player ${socket.id} in room ${room.name}. Current ready status: ${player.isReady}`);
            } else {
                console.log(`Player ${socket.id} not found in room ${room.name}`);
            }
    
            // Проверяем, если игрок найден и его статус "не готов", только тогда обновляем
            if (player && !player.isReady) {
                player.isReady = true;
                room.readyCount++;
                console.log(`Player ${socket.id} is now ready. Updated readyCount: ${room.readyCount}, Total players: ${room.players.length}`);
    
                io.to(room.name).emit('playerJoined', room.players);
                
                // Проверка: если все игроки готовы, отправляем событие 'allPlayersReady'
                if (room.readyCount === room.players.length && room.players.length > 0) {
                    console.log(`All players in room ${room.name} are ready. Emitting 'allPlayersReady' event.`);
                    io.to(room.name).emit('allPlayersReady');
                }
            } else {
                console.log(`Player ${socket.id} was already marked as ready or not found.`);
            }
    
            // Логирование для подтверждения текущего состояния готовности всех игроков
            room.players.forEach(p => {
                console.log(`Player ${p.id} - Ready Status: ${p.isReady}`);
            });
            console.log(`Current readyCount: ${room.readyCount}`);
        } else {
            console.log(`Room not found for player ${socket.id}.`);
        }
    });
    
    socket.on('startGame', () => {
        const room = getRoomByPlayer(socket.id);
        if (room) {
            console.log(`Starting game for room: ${room.name}`);
            io.to(room.name).emit('gameStarted');
        } else {
            console.error('Room not found for player:', socket.id);
        }
    });
    
    

    socket.on('disconnect', () => {
        const room = getRoomByPlayer(socket.id);
        if (room) {
            room.players = room.players.filter(p => p.id !== socket.id);
            delete players[room.name][socket.id];

            if (room.players.length === 0) {
                delete rooms[room.name];
                io.to(room.name).emit('roomClosed');
            } else {
                io.to(room.name).emit('playerJoined', room.players);
            }
        }
    });

    function getRoomByPlayer(playerId) {
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.players.some(player => player.id === playerId)) {
                room.name = roomName; // Присваиваем имя непосредственно объекту комнаты
                return room; // Возвращаем сам объект комнаты
            }
        }
        return null;
    }
    
    
    
}

module.exports = handleLobby;
