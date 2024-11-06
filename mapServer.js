// mapServer.js

module.exports = function(socket, io) {
    socket.on('uploadCustomMap', ({ mapData, roomName }) => {
        console.log(`Custom map uploaded for room ${roomName}`);
        // Отправляем карту всем участникам комнаты, включая загрузившего
        io.to(roomName).emit('receiveCustomMap', mapData);
    });
};
