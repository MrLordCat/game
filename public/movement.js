// movement.js

const movementModule = {
    setTargetPosition: function(x, y) {
        const targetPosition = { x, y };
        console.log(`Sending target position to server:`, targetPosition);
        window.socket.emit('setTargetPosition', targetPosition); // Отправка целевой позиции на сервер
    }
};

export default movementModule;
