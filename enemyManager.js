// enemyManager.js
const { isWall } = require('./playerMovementServer');


const enemiesByRoom = {}; // Хранение врагов по комнатам
const enemySizeOptions = [{ width: 2, height: 2 }, { width: 3, height: 3 }, { width: 4, height: 4 }];
const spawnInterval = 10000;
const moveInterval = 300;
let playerPositionsByRoom = {}; // Позиции игроков по комнатам
const updateIntervals = {}; 

function initializeEnemyManager(io, roomName) {
    if (!enemiesByRoom[roomName]) {
        enemiesByRoom[roomName] = [];
        playerPositionsByRoom[roomName] = { x: 50, y: 50 }; // Инициализируем начальную позицию игрока в комнате
    }

    // Проверка и запуск таймеров только если они еще не запущены
    if (!updateIntervals[roomName]) {
        updateIntervals[roomName] = {
            moveInterval: setInterval(() => updateEnemyPositions(io, roomName), moveInterval),
            spawnInterval: setInterval(() => spawnEnemy(io, playerPositionsByRoom[roomName], roomName), spawnInterval)
        };
    }
}

function updateEnemyTargets(newPlayerPosition, roomName) {
    if (!enemiesByRoom[roomName]) {
        enemiesByRoom[roomName] = []; // Убедимся, что комната инициализирована
    }
    playerPositionsByRoom[roomName] = newPlayerPosition; // Обновляем позицию игрока в комнате
    
    // Обновляем цели врагов в комнате
    enemiesByRoom[roomName].forEach(enemy => {
        enemy.targetPosition = newPlayerPosition;
    });
}

function spawnEnemy(io, playerPosition, roomName) {
    const size = enemySizeOptions[Math.floor(Math.random() * enemySizeOptions.length)];
    const newEnemy = {
        id: generateEnemyId(),
        position: { x: 50, y: 50 },
        size: size,
        health: 100,
        target: 'player',
        targetPosition: playerPosition
    };
    enemiesByRoom[roomName].push(newEnemy);
    io.to(roomName).emit('newEnemy', newEnemy);
}

function updateEnemyPositions(io, roomName) {
    if (!enemiesByRoom[roomName]) {
        enemiesByRoom[roomName] = []; // Убедимся, что комната инициализирована
    }
    enemiesByRoom[roomName].forEach((enemy) => {
        if (enemy.target === 'player' && enemy.targetPosition) {
            moveEnemyToTarget(io, enemy, enemy.targetPosition, roomName);
        }
        io.to(roomName).emit('updateEnemy', { id: enemy.id, position: enemy.position });
    });
}

function moveEnemyToTarget(io, enemy, targetPosition, roomName) {
    const nextX = enemy.position.x + Math.sign(targetPosition.x - enemy.position.x);
    const nextY = enemy.position.y + Math.sign(targetPosition.y - enemy.position.y);

    // Проверяем все клетки, которые занимает враг
    for (let dx = 0; dx < enemy.size.width; dx++) {
        for (let dy = 0; dy < enemy.size.height; dy++) {
            if (isWall(nextX + dx, nextY + dy, roomName)) {
                return; // Останавливаем движение, если хотя бы одна из клеток занята
            }
        }
    }

    enemy.position.x = nextX;
    enemy.position.y = nextY;

    io.to(roomName).emit('updateEnemy', { id: enemy.id, position: enemy.position });
}


function generateEnemyId() {
    return 'enemy_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {
    initializeEnemyManager,
    updateEnemyTargets,
    enemiesByRoom,
};
