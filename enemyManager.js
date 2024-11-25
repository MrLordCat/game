const { isWall, updateMapData, updateOverlayData, mapDataByRoom, overlayMapDataByRoom } = require('./playerMovementServer');
const { aStar } = require('./pathfinding');
const playerBuildings = require('./playerBuildings');

const enemiesByRoom = {}; 
const enemySizeOptions = [{ width: 3, height: 3 }, { width: 4, height: 4 }];
const spawnInterval = 10000;
const moveInterval = 300;
let playerPositionsByRoom = {}; 
const updateIntervals = {}; 
const maxEnemiesPerRoom = 4;

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
        const mapData = mapDataByRoom[roomName];
        const overlayMapData = overlayMapDataByRoom[roomName];
        if (mapData && overlayMapData) {
            enemy.path = aStar(enemy.position, enemy.targetPosition, mapData, overlayMapData, enemy.size);

        }
    });
}

function spawnEnemy(io, playerPosition, roomName) {
    if (enemiesByRoom[roomName].length >= maxEnemiesPerRoom) {
        return;
    }

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
        if (enemy.targetBuilding) {
            attackBuilding(enemy, io, roomName); // Атака здания
        } else if (enemy.path && enemy.path.length > 0) {  
            const nextPosition = enemy.path.shift();

            const building = isBuilding(nextPosition, overlayMapData, enemy.size);
            if (building) {
                enemy.path = []; 
                enemy.targetBuilding = building;
                return;
            }

            if (canMoveToPosition(nextPosition, enemy.size, roomName, mapData, [])) {
                enemy.position = nextPosition;
            }

            io.to(roomName).emit('updateEnemy', { id: enemy.id, position: enemy.position });
        } else if (enemy.target === 'player' && enemy.targetPosition) {
            enemy.path = aStar(enemy.position, enemy.targetPosition, mapData, [], enemy.size);
        }
    });
}

function attackBuilding(enemy, io, roomName) {
    if (enemy.targetBuilding) {
        const building = enemy.targetBuilding;
        const destroyed = playerBuildings.attackBuilding(roomName, building.buildingId, 10, overlayMapDataByRoom, io); // Наносим 10 урона

        if (destroyed) {
            const overlayIndex = overlayMapDataByRoom[roomName].findIndex(b => b.buildingId === building.buildingId);
            if (overlayIndex !== -1) {
                overlayMapDataByRoom[roomName].splice(overlayIndex, 1);
            }
            io.to(roomName).emit('updateOverlayMap', overlayMapDataByRoom[roomName]);
            enemy.targetBuilding = null;
        }
    }
}

function isBuilding(position, overlayMapData, size) {
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const checkX = position.x + dx;
            const checkY = position.y + dy;

            const building = overlayMapData.find(b => (
                checkX >= b.x &&
                checkX < b.x + b.width &&
                checkY >= b.y &&
                checkY < b.y + b.height
            ));

            if (building) {
                return building; 
            }
        }
    }
    return null; 
}




function canMoveToPosition(position, size, roomName, localMapData, localOverlayMapData) {
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const checkX = position.x + dx;
            const checkY = position.y + dy;

            if (checkX < 0 || checkY < 0 || checkY >= localMapData.length || checkX >= localMapData[0].length) {
                return false;
            }

    
            if (isWall(checkX, checkY, localMapData, localOverlayMapData)) {
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
