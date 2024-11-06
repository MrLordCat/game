// movement.js

const movementModule = {
    setTargetPosition: function(x, y) {
        const roomName = window.gameCore.lobby.roomName; // Получаем roomName из gameCore
        const targetPosition = { x, y };
        console.log(`Sending target position to server for room ${roomName}:`, targetPosition);
        window.socket.emit('setTargetPosition', { roomName, targetPosition }); // Отправка целевой позиции и имени комнаты на сервер
    }
};

export default movementModule;
