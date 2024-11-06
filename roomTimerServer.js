// roomTimerServer.js

const roomTimers = {}; // Объект для хранения таймеров комнат

function startRoomTimer(io, roomName) {
    if (roomTimers[roomName]) {
        clearInterval(roomTimers[roomName].interval); // Останавливаем предыдущий таймер, если есть
    }

    let time = 0;
    roomTimers[roomName] = {
        interval: setInterval(() => {
            time += 1;
            io.to(roomName).emit('updateTimer', time); // Отправляем время клиентам комнаты

            
            if (time >= 600) { 
                endRoomTimer(io, roomName);
                io.to(roomName).emit('gameEnded', 'Time limit reached');
            }
        }, 1000),
        time
    };
    console.log(`Timer started for room: ${roomName}`);
}

function endRoomTimer(io, roomName) {
    if (roomTimers[roomName]) {
        clearInterval(roomTimers[roomName].interval);
        delete roomTimers[roomName];
        io.to(roomName).emit('updateTimer', 0); // Сброс таймера на интерфейсе
        console.log(`Timer stopped for room: ${roomName}`);
    }
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('startGame', ({ roomName }) => {
            if (roomName) {
                startRoomTimer(io, roomName);
            }
        });

        socket.on('endGame', ({ roomName }) => {
            if (roomName) {
                endRoomTimer(io, roomName);
            }
        });

        socket.on('disconnect', () => {
            const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
            rooms.forEach(roomName => {
                const room = io.sockets.adapter.rooms.get(roomName);
                if (!room || room.size === 1) {
                    endRoomTimer(io, roomName);
                }
            });
        });
    });
};
