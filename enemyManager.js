const { isWall, updateMapData, updateOverlayData, mapDataByRoom, overlayMapDataByRoom } = require('./playerMovementServer');
const { aStar } = require('./pathfinding');

const enemiesByRoom = {}; 
const enemySizeOptions = [{ width: 2, height: 2 }, { width: 3, height: 3 }, { width: 4, height: 4 }];
const spawnInterval = 10000;
const moveInterval = 300;
let playerPositionsByRoom = {}; 
const updateIntervals = {}; 

function initializeEnemyManager(io, roomName) {
    if (!enemiesByRoom[roomName]) {
        enemiesByRoom[roomName] = [];
        playerPositionsByRoom[roomName] = { x: 50, y: 50 };
    }

    if (!updateIntervals[roomName]) {
        updateIntervals[roomName] = {
            moveInterval: setInterval(() => updateEnemyPositions(io, roomName, mapDataByRoom[roomName], overlayMapDataByRoom[roomName]), moveInterval),
            spawnInterval: setInterval(() => spawnEnemy(io, playerPositionsByRoom[roomName], roomName), spawnInterval)
        };
    }
}

function updateEnemyTargets(newPlayerPosition, roomName) {
    if (!enemiesByRoom[roomName]) {
        enemiesByRoom[roomName] = [];
    }

    playerPositionsByRoom[roomName] = newPlayerPosition;

    enemiesByRoom[roomName].forEach(enemy => {
        enemy.targetPosition = newPlayerPosition;
        // Передаем данные карты в aStar напрямую
        const mapData = mapDataByRoom[roomName];
        const overlayMapData = overlayMapDataByRoom[roomName];
        if (mapData && overlayMapData) {
            enemy.path = aStar(enemy.position, enemy.targetPosition, mapData, overlayMapData);
        }
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
        targetPosition: playerPosition,
        path: []
    };
    enemiesByRoom[roomName].push(newEnemy);
    io.to(roomName).emit('newEnemy', newEnemy);
}

function updateEnemyPositions(io, roomName) {
   
    const mapData = mapDataByRoom[roomName] ? JSON.parse(JSON.stringify(mapDataByRoom[roomName])) : [];
    const overlayMapData = overlayMapDataByRoom[roomName] ? JSON.parse(JSON.stringify(overlayMapDataByRoom[roomName])) : [];

    enemiesByRoom[roomName].forEach((enemy) => {
        if (enemy.path && enemy.path.length > 0) {
            const nextPosition = enemy.path.shift();

            if (canMoveToPosition(nextPosition, enemy.size, roomName, mapData, overlayMapData)) {
                enemy.position = nextPosition;
            }

            io.to(roomName).emit('updateEnemy', { id: enemy.id, position: enemy.position });
        } else if (enemy.target === 'player' && enemy.targetPosition) {
            enemy.path = aStar(enemy.position, enemy.targetPosition, mapData, overlayMapData);
        }
    });
}




function canMoveToPosition(position, size, roomName, localMapData, localOverlayMapData) {
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            if (isWall(position.x + dx, position.y + dy, localMapData, localOverlayMapData)) {
                return false;
            }
        }
    }
    return true;
}


function generateEnemyId() {
    return 'enemy_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {
    initializeEnemyManager,
    updateEnemyTargets,
    spawnEnemy,
    updateEnemyPositions,
    updateMapData,
    updateOverlayData
};
