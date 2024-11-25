const buildingModule = require('./buildingModule');
const { playersByRoom } = require('./playerMovementServer');
const { getRoomMap } = require('./mapServer');
const { updateOverlayData } = require('./playerMovementServer');
const playerBuildings = require('./playerBuildings');

const roomOverlays = {}; // Локальное хранилище данных о зданиях

module.exports = (socket, io) => {
    socket.on('requestOverlayMap', ({ roomName }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
        socket.emit('loadOverlayMap', roomOverlays[roomName]);
    });

    socket.on('placeBuilding', ({ roomName, x, y, building, ownerId }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];

        const mapData = getRoomMap(roomName);
        const players = playersByRoom[roomName] || {};

        if (isPositionBlocked(x, y, building.size, mapData, players, roomName)) {
            socket.emit('placementFailed', { x, y });
            return;
        }

        const buildingData = buildingModule.buildings[building.name];
        if (!buildingData) {
            console.error(`Building type ${building.name} not found in buildingModule.`);
            return;
        }

        const buildingId = generateBuildingId();
        const newBuilding = {
            buildingId,
            ownerId,
            x,
            y,
            width: buildingData.size.width,
            height: buildingData.size.height,
            name: buildingData.name,
            health: buildingData.health,
            armor: buildingData.armor,
            hasMenu: building.hasMenu || false,
        };

        roomOverlays[roomName].push(newBuilding); // Добавляем здание в roomOverlays
        playerBuildings.addBuilding(roomName, newBuilding, roomOverlays, io);

        // Обновляем данные для клиентов
        io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        updateOverlayData(roomName, roomOverlays[roomName]);
        socket.emit('buildingDataResponse', newBuilding);
        console.log(`Building placed at (${x}, ${y}) in room ${roomName} by player ${ownerId} with ID ${buildingId}.`);
    });
    socket.on('subscribeBuilding', ({ buildingId }) => {
        const playerBuildingsModule = require('./playerBuildings');
        playerBuildingsModule.subscribeToBuilding(socket, buildingId);
    });
    
    socket.on('requestBuildingData', ({ roomName, buildingId }) => {
        const buildingData = roomOverlays[roomName]?.find(building => building.buildingId === buildingId);

        if (buildingData) {
            socket.emit('buildingDataResponse', buildingData);
        } else {
            console.error(`Building with ID ${buildingId} not found in room ${roomName}.`);
            socket.emit('buildingDataResponse', null);
        }
    });

    function generateBuildingId() {
        return 'building_' + Math.random().toString(36).substr(2, 9);
    }

    function isPositionBlocked(x, y, size, mapData, players, roomName) {
        // Проверяем пересечение с существующими зданиями в roomOverlays
        const isOverlayBlocked = (roomOverlays[roomName] || []).some(building => {
            return (
                x < building.x + building.width &&
                x + size.width > building.x &&
                y < building.y + building.height &&
                y + size.height > building.y
            );
        });

        if (isOverlayBlocked) {
            console.log(`Blocked by another building at (${x}, ${y}) in room ${roomName}.`);
            return true;
        }

        // Проверяем пересечение с объектами карты
        for (let i = 0; i < size.width; i++) {
            for (let j = 0; j < size.height; j++) {
                if (mapData[y + j] && mapData[y + j][x + i] && mapData[y + j][x + i].type === 'wall') {
                    console.log(`Blocked by wall at (${x + i}, ${y + j}) in room ${roomName}.`);
                    return true;
                }
            }
        }

        // Проверяем пересечение с игроками или врагами
        const isPlayerOrEnemyBlocked = Object.values(players).some(player => {
            return (
                x < player.x + 1 &&
                x + size.width > player.x &&
                y < player.y + 1 &&
                y + size.height > player.y
            );
        });

        if (isPlayerOrEnemyBlocked) {
            console.log(`Blocked by player or enemy at (${x}, ${y}) in room ${roomName}.`);
            return true;
        }

        return false;
    }
};

module.exports.roomOverlays = roomOverlays;
