// enemyManager.js

let enemies = [];
const enemySizeOptions = [{ width: 2, height: 2 }, { width: 3, height: 3 }, { width: 4, height: 4 }];
const spawnInterval = 30000; // Интервал спауна врагов в миллисекундах
const moveInterval = 500; // Интервал обновления движения врагов

function initializeEnemyManager(io) {
    setInterval(() => updateEnemyPositions(io), moveInterval);
    setInterval(() => spawnEnemy(io), spawnInterval);
}

function updateEnemyTargets(playerPosition) {
    //console.log("Updated enemy target position:", playerPosition);
    enemies.forEach(enemy => {
        enemy.targetPosition = playerPosition;
    //    console.log("Updated enemy target position:", playerPosition);
    });
}

function spawnEnemy(io) {
    const size = enemySizeOptions[Math.floor(Math.random() * enemySizeOptions.length)];
    const newEnemy = {
        id: generateEnemyId(),
        position: { x: 50, y: 50 }, // Центральная позиция для спауна врагов
        size: size,
        health: 100,
        target: 'player',
        targetPosition: { x: 50, y: 50 } // Начальная цель по умолчанию
    };
    enemies.push(newEnemy);
    io.emit('newEnemy', newEnemy); // Отправляем информацию о новом враге клиентам
}

function updateEnemyPositions(io) {
    enemies.forEach((enemy) => {
        if (enemy.target === 'player' && enemy.targetPosition) {
            moveToTarget(enemy, enemy.targetPosition);
        }
        io.emit('updateEnemy', { id: enemy.id, position: enemy.position });
    });
}

function moveToTarget(enemy, targetPosition) {
    const dx = targetPosition.x - enemy.position.x;
    const dy = targetPosition.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const stepX = dx / distance;
        const stepY = dy / distance;

        enemy.position.x += stepX;
        enemy.position.y += stepY;
    }
}

function generateEnemyId() {
    return 'enemy_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {
    initializeEnemyManager,
    updateEnemyTargets, // Экспорт функции для обновления цели врагов
    enemies,
};
