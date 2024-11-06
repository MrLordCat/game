// enemyManager.js

const { isWall } = require('./playerMovementServer'); // Импортируем функцию isWall для проверки препятствий

let enemies = [];
const enemySizeOptions = [{ width: 2, height: 2 }, { width: 3, height: 3 }, { width: 4, height: 4 }];
const spawnInterval = 5000;
const moveInterval = 500;
let playerPosition = { x: 50, y: 50 }; // Переменная для хранения актуальной позиции игрока

function initializeEnemyManager(io) {
    setInterval(() => updateEnemyPositions(io), moveInterval);
    setInterval(() => spawnEnemy(io, playerPosition), spawnInterval);
}

function updateEnemyTargets(newPlayerPosition) {
    playerPosition = newPlayerPosition; // Обновляем позицию игрока
    enemies.forEach(enemy => {
        enemy.targetPosition = playerPosition;
    });
}

function spawnEnemy(io, playerPosition) {
    const size = enemySizeOptions[Math.floor(Math.random() * enemySizeOptions.length)];
    const newEnemy = {
        id: generateEnemyId(),
        position: { x: 50, y: 50 },
        size: size,
        health: 100,
        target: 'player',
        targetPosition: playerPosition // Устанавливаем текущую позицию игрока как цель
    };
    enemies.push(newEnemy);
    io.emit('newEnemy', newEnemy);
}

function updateEnemyPositions(io) {
    enemies.forEach((enemy) => {
        if (enemy.target === 'player' && enemy.targetPosition) {
            moveEnemyToTarget(io, enemy, enemy.targetPosition);
        }
        io.emit('updateEnemy', { id: enemy.id, position: enemy.position });
    });
}

// Функция движения врагов с учетом препятствий
function moveEnemyToTarget(io, enemy, targetPosition) {
    const nextX = enemy.position.x + Math.sign(targetPosition.x - enemy.position.x);
    const nextY = enemy.position.y + Math.sign(targetPosition.y - enemy.position.y);

    // Проверка на препятствие
    if (isWall(nextX, nextY)) {
        return; // Останавливаем движение, если впереди стена
    }

    enemy.position.x = nextX;
    enemy.position.y = nextY;

    // Обновляем позицию на клиенте
    io.emit('updateEnemy', { id: enemy.id, position: enemy.position });
}

function generateEnemyId() {
    return 'enemy_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {
    initializeEnemyManager,
    updateEnemyTargets,
    enemies,
};
