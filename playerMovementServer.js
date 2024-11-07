// playerMovementServer.js
const playersByRoom = {}; // Хранение игроков по комнатам
const moveIntervals = {};
const mapDataByRoom = {}; // Хранение основной карты по комнатам
const overlayMapDataByRoom = {}; // Хранение overlay карт по комнатам

function updateMapData(roomName, newMapData) {
    if (roomName) {
        mapDataByRoom[roomName] = newMapData;
        console.log(`Map data in playerMovementServer updated for room .`,roomName);
    } else {
        console.error("Error: roomName is undefined in updateMapData.");
    }
}

function updateOverlayData(roomName, newOverlayMapData) {
    if (roomName) {
        overlayMapDataByRoom[roomName] = newOverlayMapData;
        console.log(`Overlay map data in playerMovementServer updated for room .`);
    } else {
        console.error("Error: roomName is undefined in updateOverlayData.");
    }
}

function handlePlayerMovement(socket, io, updateEnemyTargets) {
    socket.on('initializePlayer', ({ roomName }) => {
        if (!roomName) {
            console.error("Error: roomName not provided in initializePlayer event");
            return;
        }

        if (!playersByRoom[roomName]) playersByRoom[roomName] = {};
        playersByRoom[roomName][socket.id] = { x: 50, y: 50 };
        socket.join(roomName);

        io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);
    });

    socket.on('setTargetPosition', ({ roomName, targetPosition }) => {
        if (!roomName || !playersByRoom[roomName]) {
            console.error(`Error: roomName not provided or room not found in setTargetPosition for socket ${socket.id}`);
            return;
        }

        const player = playersByRoom[roomName][socket.id];
        if (!player) {
            console.error(`Error: Player not found in room ${roomName} for socket ${socket.id}`);
            return;
        }

        if (moveIntervals[socket.id]) {
            clearInterval(moveIntervals[socket.id]);
        }

        moveIntervals[socket.id] = movePlayerToTarget(socket, io, player, targetPosition, roomName, updateEnemyTargets);
    });

    socket.on('disconnect', () => {
        for (const roomName in playersByRoom) {
            if (playersByRoom[roomName][socket.id]) {
                clearInterval(moveIntervals[socket.id]);
                delete moveIntervals[socket.id];
                delete playersByRoom[roomName][socket.id];
                io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);
                
                if (Object.keys(playersByRoom[roomName]).length === 0) {
                    delete playersByRoom[roomName];
                    console.log(`Room ${roomName} is now empty.`);
                }
            }
        }
    });
}

function isWall(x, y, roomName) {
    const mapData = mapDataByRoom[roomName] || []; // Получаем данные карты по комнате
    const overlayMapData = overlayMapDataByRoom[roomName] || []; // Получаем overlay карту по комнате

    // Проверяем наличие стены
    if (y >= 0 && y < mapData.length && x >= 0 && x < mapData[0].length) {
        if (mapData[y][x].type === 'wall') return true;
    }

    return overlayMapData.some(building => {
        return (
            x >= building.x &&
            x < building.x + building.width &&
            y >= building.y &&
            y < building.y + building.height
        );
    });
}

function movePlayerToTarget(socket, io, player, targetPosition, roomName, updateEnemyTargets) {
    return setInterval(() => {
        const deltaX = targetPosition.x - player.x;
        const deltaY = targetPosition.y - player.y;
        const nextX = deltaX !== 0 ? player.x + Math.sign(deltaX) : player.x;
        const nextY = deltaY !== 0 ? player.y + Math.sign(deltaY) : player.y;

        if (isWall(nextX, nextY, roomName)) {
            clearInterval(moveIntervals[socket.id]);
            delete moveIntervals[socket.id];
            return;
        }

        player.x = nextX;
        player.y = nextY;

        // Используем updateEnemyTargets для обновления позиции врагов
        updateEnemyTargets({ x: player.x, y: player.y }, roomName);

        io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);

        if (player.x === targetPosition.x && player.y === targetPosition.y) {
            clearInterval(moveIntervals[socket.id]);
            delete moveIntervals[socket.id];
            return;
        }
    }, 100);
}

module.exports = {
    handlePlayerMovement,
    updateMapData,
    updateOverlayData,
    playersByRoom,
    isWall
};
