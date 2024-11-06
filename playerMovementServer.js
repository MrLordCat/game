// playerMovementServer.js

const players = {}; // Хранение данных о позициях игроков
const moveIntervals = {}; // Хранение интервалов передвижения для каждого игрок
let mapData = []; // Переменная для хранения данных карты

// Функция для обновления карты
function updateMapData(newMapData) {
    mapData = newMapData;
    console.log("Map data in playerMovementServer updated.");
}

function handlePlayerMovement(socket, io) {
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

        // Останавливаем текущий интервал, если он уже существует
        if (moveIntervals[socket.id]) {
            clearInterval(moveIntervals[socket.id]);
        }

        // Начало передвижения к целевой позиции
        moveIntervals[socket.id] = movePlayerToTarget(socket, io, player, targetPosition);
    });

    // Удаление игрока при отключении
    socket.on('disconnect', () => {
        clearInterval(moveIntervals[socket.id]); // Останавливаем интервал передвижения при отключении
        delete moveIntervals[socket.id];
        delete players[socket.id];
        io.emit('updatePlayers', players); // Уведомляем остальных клиентов
        console.log(`Player ${socket.id} disconnected and removed from players list.`);
    });
}

// Функция для проверки, является ли клетка стеной
function isWall(x, y) {
    // Проверяем, находится ли клетка в пределах карты
    if (y >= 0 && y < mapData.length && x >= 0 && x < mapData[0].length) {
        return mapData[y][x].type === 'wall';
    }
    return false;
}

// Функция для перемещения игрока к целевой позиции
function movePlayerToTarget(socket, io, player, targetPosition) {
    return setInterval(() => {
        const nextX = player.x + Math.sign(targetPosition.x - player.x);
        const nextY = player.y + Math.sign(targetPosition.y - player.y);

        // Проверка наличия стены на следующей клетке
        if (isWall(nextX, nextY)) {
            console.log(`Player ${socket.id} encountered a wall at (${nextX}, ${nextY})`);
            clearInterval(moveIntervals[socket.id]); // Останавливаем передвижение, если есть стена
            delete moveIntervals[socket.id];
            return;
        }

        // Обновляем позицию игрока только если на пути нет стены
        player.x = nextX;
        player.y = nextY;

        // Проверка достижения целевой позиции
        if (player.x === targetPosition.x && player.y === targetPosition.y) {
            clearInterval(moveIntervals[socket.id]); // Останавливаем передвижение при достижении цели
            delete moveIntervals[socket.id];
            return;
        }

        // Обновляем клиентов с текущим положением
        io.emit('updatePlayers', players);
    }, 200); // Интервал передвижения
}

module.exports = {
    handlePlayerMovement,
    updateMapData
};
