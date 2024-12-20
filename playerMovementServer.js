// playerMovementServer.js
const { aStar } = require('./pathfinding'); // Подключаем модуль поиска пути
const playerBuildings = require('./playerBuildings');
const playersByRoom = {}; 
const moveIntervals = {};
const mapDataByRoom = {}; 
const overlayMapDataByRoom = {}; 
function getPlayerRoom(socketId) {
    for (const roomName in playersByRoom) {
        if (playersByRoom[roomName][socketId]) {
            return roomName;
        }
    }
    return null; // Возвращает null, если игрок не найден в какой-либо комнате
}
function updateMapData(roomName, newMapData) {
    if (roomName) {
        mapDataByRoom[roomName] = newMapData;
        console.log(`Map data in playerMovementServer updated for room .`, roomName);
    } else {
        console.error("Error: roomName is undefined in updateMapData.");
    }
}

function updateOverlayData(roomName, newOverlayMapData) {
    if (roomName) {
        overlayMapDataByRoom[roomName] = newOverlayMapData;
        console.log(`Overlay map data in playerMovementServer updated for room.`);
    } else {
        console.error("Error: roomName is undefined in updateOverlayData.");
    }
}
function moveToBuildingAndRepair(socket, io, buildingId, roomName) {
    const player = playersByRoom[roomName][socket.id];
    const roomOverlays = overlayMapDataByRoom[roomName];
    const building = roomOverlays.find(b => b.buildingId === buildingId);

    if (!building) {
        socket.emit('repairFailed', { message: "Building not found" });
        return;
    }

    const distance = Math.sqrt(
        Math.pow(player.x - building.x, 2) + Math.pow(player.y - building.y, 2)
    );

    if (distance > 1) { // Если игрок не рядом
        const path = aStar(player, { x: building.x, y: building.y }, mapDataByRoom[roomName], roomOverlays);
        if (path.length > 0) {
            moveAlongPath(socket, io, player, path, roomName, () => {
                playerBuildings.startRepair(socket, io, buildingId, roomName, playersByRoom, overlayMapDataByRoom);
            });
        } else {
            socket.emit('repairFailed', { message: "No path to building" });
        }
    } else {
        playerBuildings.startRepair(socket, io, buildingId, roomName, playersByRoom, overlayMapDataByRoom);
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
    
    socket.on('repairBuilding', ({ buildingId }) => {
        const roomName = getPlayerRoom(socket.id);
        if (roomName) {
            moveToBuildingAndRepair(socket, io, buildingId, roomName);
        } else {
            socket.emit('repairFailed', { message: "Player not in a room" });
        }
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

        // Используем алгоритм A* для поиска пути
        const path = aStar(player, targetPosition, mapDataByRoom[roomName], overlayMapDataByRoom[roomName]);
        if (path.length === 0) {
            console.log(`Path not found for player ${socket.id} in room ${roomName}`);
            return;
        }

        moveIntervals[socket.id] = moveAlongPath(socket, io, player, path, roomName, updateEnemyTargets);
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

function moveAlongPath(socket, io, player, path, roomName, updateEnemyTargets) {
    let pathIndex = 0;

    // Проверка наличия данных карты перед копированием
    const localMapData = mapDataByRoom[roomName] ? JSON.parse(JSON.stringify(mapDataByRoom[roomName])) : [];
    const localOverlayMapData = overlayMapDataByRoom[roomName] ? JSON.parse(JSON.stringify(overlayMapDataByRoom[roomName])) : [];

    const intervalId = setInterval(() => {
        if (pathIndex >= path.length) {
            clearInterval(intervalId);
            delete moveIntervals[socket.id];
            return;
        }

        const nextPosition = path[pathIndex];
        if (isWall(nextPosition.x, nextPosition.y, localMapData, localOverlayMapData)) {
            clearInterval(intervalId);
            delete moveIntervals[socket.id];
            return;
        }

        player.x = nextPosition.x;
        player.y = nextPosition.y;
        pathIndex++;

        updateEnemyTargets({ x: player.x, y: player.y }, roomName);
        io.to(roomName).emit('updatePlayers', playersByRoom[roomName]);
    }, 100);

    moveIntervals[socket.id] = intervalId;
}



function isWall(x, y, mapData, overlayMapData = []) {
    // Проверяем наличие стены в основной карте
    if (y >= 0 && y < mapData.length && x >= 0 && x < mapData[0].length) {
        if (mapData[y][x].type === 'wall') return true;
    }
    
    // Проверяем наличие здания в overlay карте, если данные существуют
    return overlayMapData && overlayMapData.some(building => (
        x >= building.x &&
        x < building.x + building.width &&
        y >= building.y &&
        y < building.y + building.height
    ));
}


module.exports = {
    handlePlayerMovement,
    updateMapData,
    updateOverlayData,
    playersByRoom,
    isWall,
    mapDataByRoom,       
    overlayMapDataByRoom 
};
