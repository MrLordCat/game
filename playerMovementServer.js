// playerMovementServer.js

const players = {}; // Хранение данных о позициях игроков

module.exports = (socket, io) => {
    // Инициализация игрока
    socket.on('initializePlayer', () => {
        players[socket.id] = { x: 50, y: 50 }; // Стартовая позиция игрока
        io.emit('updatePlayers', players); // Обновляем всех клиентов
    });

    // Обработка целевой позиции
    socket.on('setTargetPosition', (targetPosition) => {
        console.log(`Player ${socket.id} set target position:`, targetPosition);
        const player = players[socket.id];
        if (!player) return;

        // Начало передвижения к целевой позиции
        movePlayerToTarget(socket, io, player, targetPosition);
    });

    // Удаление игрока при отключении
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players); // Уведомляем остальных клиентов
        console.log(`Player ${socket.id} disconnected and removed from players list.`);
    });
};

// Функция для перемещения игрока к целевой позиции
function movePlayerToTarget(socket, io, player, targetPosition) {
    const moveInterval = setInterval(() => {
        if (player.x === targetPosition.x && player.y === targetPosition.y) {
            clearInterval(moveInterval); // Останавливаем передвижение
            return;
        }

        // Рассчитываем следующее положение
        player.x += Math.sign(targetPosition.x - player.x);
        player.y += Math.sign(targetPosition.y - player.y);

        // Обновляем клиентов с текущим положением
        io.emit('updatePlayers', players);
    }, 100); // Интервал передвижения
}
