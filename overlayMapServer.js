// overlayMapServer.js

const roomOverlays = {}; // Хранение данных overlay для каждой комнаты
const buildingModule = require('./buildingModule');
const { playersByRoom } = require('./playerMovementServer');
const { getRoomMap } = require('./mapServer');
const { updateOverlayData } = require('./playerMovementServer'); // Импортируем updateOverlayData напрямую

module.exports = (socket, io) => {
    

    socket.on('requestOverlayMap', ({ roomName }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
        socket.emit('loadOverlayMap', roomOverlays[roomName]);
    });
    socket.on('requestBuildingData', ({ roomName, buildingId }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
        
        // Ищем здание в overlay карте комнаты
        const basicBuildingData = roomOverlays[roomName].find(building => building.name === buildingId);
        
        if (basicBuildingData) {
            // Получаем полные данные о здании из buildingModule
            const fullBuildingData = buildingModule.buildings[buildingId];
            
            if (fullBuildingData) {
                const buildingData = { ...basicBuildingData, ...fullBuildingData };
                socket.emit('buildingDataResponse', buildingData);
            } else {
                console.error(`Building data not found for ID ${buildingId} in buildingModule.`);
                socket.emit('buildingDataResponse', null);
            }
        } else {
            console.error(`Basic building data not found for ID ${buildingId} in overlay for room ${roomName}.`);
            socket.emit('buildingDataResponse', null);
        }
    });
    socket.on('placeBuilding', ({ roomName, x, y, building }) => {
        if (!roomOverlays[roomName]) roomOverlays[roomName] = [];
        
        const mapData = getRoomMap(roomName);
        const players = playersByRoom[roomName] || {};

        if (isPositionBlocked(x, y, building.size, mapData, players, roomName)) {
            socket.emit('placementFailed', { x, y });
            console.log(`Position (${x}, ${y}) is blocked in room ${roomName}, cannot place building.`);
            return;
        }

        const newBuilding = {
            x,
            y,
            width: building.size.width,
            height: building.size.height,
            name: building.name,
            health: building.health,
            armor: building.armor,
            hasMenu: building.hasMenu,
        };
    
        roomOverlays[roomName].push(newBuilding);
        io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        updateOverlayData(roomName, roomOverlays[roomName]); // Обновляем overlay данные для playerMovementServer
    });

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