// overlayMapServer.js

const roomOverlays = {}; // Хранение данных overlay для каждой комнаты
const buildingModule = require('./buildingModule');
const { playersByRoom } = require('./playerMovementServer');
const { getRoomMap } = require('./mapServer');
const { updateOverlayData } = require('./playerMovementServer'); 
const playerBuildings = require('./playerBuildings');

module.exports = (socket, io) => {
    

    socket.on('requestOverlayMap', ({ roomName }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
        socket.emit('loadOverlayMap', roomOverlays[roomName]);
    });
   socket.on('requestBuildingData', ({ roomName, buildingId }) => {
    // Проверяем, есть ли информация о зданиях в playerBuildings
    const buildingData = playerBuildings.getBuildingById(roomName, buildingId);
    
    if (buildingData) {
        // Отправляем актуальные данные здания клиенту
        socket.emit('buildingDataResponse', buildingData);
    } else {
        console.error(`Building with ID ${buildingId} not found in playerBuildings for room ${roomName}.`);
        socket.emit('buildingDataResponse', null); // Отправляем null, если здание не найдено
    }
});
    socket.on('placeBuilding', ({ roomName, x, y, building, ownerId }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
        
        const mapData = getRoomMap(roomName);
        const players = playersByRoom[roomName] || {};
        
        if (isPositionBlocked(x, y, building.size, mapData, players, roomName)) {
            socket.emit('placementFailed', { x, y });
            console.log(`Position (${x}, ${y}) is blocked in room ${roomName}, cannot place building.`);
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
    
        roomOverlays[roomName].push(newBuilding);
        playerBuildings.addBuilding(roomName, newBuilding); // Добавляем здание в playerBuildings
        io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        updateOverlayData(roomName, roomOverlays[roomName]); // Обновляем overlay данные для playerMovementServer
        console.log(`Building placed at (${x}, ${y}) in room ${roomName} by player ${ownerId} with ID ${buildingId}.`);
    });
    
    function generateBuildingId() {
        return 'building_' + Math.random().toString(36).substr(2, 9);
    }
    
    function isPositionBlocked(x, y, size, mapData, players, roomName) {
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
    
        for (let i = 0; i < size.width; i++) {
            for (let j = 0; j < size.height; j++) {
                if (mapData[y + j] && mapData[y + j][x + i] && mapData[y + j][x + i].type === 'wall') {
                    console.log(`Blocked by wall at (${x + i}, ${y + j}) in room ${roomName}.`);
                    return true;
                }
            }
        }
    
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
module.exports.clearOverlayMap = (roomName) => {
    if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
    roomOverlays[roomName].length = 0;
    updateOverlayData(roomName, roomOverlays[roomName]); // Обновляем overlay данные в playerMovementServer
    console.log(`Overlay map cleared for room ${roomName}`);
};