// overlayMapServer.js

const overlayMapData = []; // Хранение информации о координатах построек
const buildingModule = require('./buildingModule'); // Импорт buildingModule
const { players } = require('./playerMovementServer'); 

module.exports = (socket, io, updateOverlayMap) => {
    socket.on('requestOverlayMap', () => {
        socket.emit('loadOverlayMap', overlayMapData);
        console.log('Overlay map data sent to client.');
    });

    socket.on('placeBuilding', (data) => {
        const { x, y, building } = data;
        const mapData = require('./mapServer').getCurrentMap();
        
        if (isPositionBlocked(x, y, building.size, mapData, players)) {
            socket.emit('placementFailed', { x, y });
            console.log(`Position (${x}, ${y}) is blocked, cannot place building.`);
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
    
        overlayMapData.push(newBuilding);
        io.emit('updateOverlayMap', overlayMapData);
        updateOverlayMap(overlayMapData); 
    });

    // Обработка запроса на получение данных о здании
    socket.on('requestBuildingData', ({ buildingId }) => {
        const basicBuildingData = overlayMapData.find(building => building.name === buildingId);
        
        if (basicBuildingData) {
            // Используем buildingId как есть, без приведения к нижнему регистру
            const fullBuildingData = buildingModule.buildings[buildingId] || {};
            console.log("Данные из buildingModule для ID", buildingId, ":", fullBuildingData);
            const buildingData = { ...basicBuildingData, ...fullBuildingData };
            
            socket.emit('buildingDataResponse', buildingData);
            console.log("Отправка полных данных о здании:", buildingData);
        } else {
            socket.emit('buildingDataResponse', null);
        }
    });

    socket.on('clearOverlayMap', () => {
        overlayMapData.length = 0;
        io.emit('updateOverlayMap', overlayMapData);
        console.log('Overlay map cleared.');
    });

    function isPositionBlocked(x, y, size, mapData, players) {
        // Проверка наложения на другие здания
        const isOverlayBlocked = overlayMapData.some(building => {
            return (
                x < building.x + building.width &&
                x + size.width > building.x &&
                y < building.y + building.height &&
                y + size.height > building.y
            );
        });
    
        if (isOverlayBlocked) {
            console.log(`Blocked by another building at (${x}, ${y}).`);
            return true;
        }
    
        // Проверка на стены карты
        for (let i = 0; i < size.width; i++) {
            for (let j = 0; j < size.height; j++) {
                if (mapData[y + j] && mapData[y + j][x + i] && mapData[y + j][x + i].type === 'wall') {
                    console.log(`Blocked by wall at (${x + i}, ${y + j}).`);
                    return true;
                }
            }
        }
    
        // Проверка на игроков и врагов
        const isPlayerOrEnemyBlocked = Object.values(players).some(player => {
            return (
                x < player.x + 1 &&
                x + size.width > player.x &&
                y < player.y + 1 &&
                y + size.height > player.y
            );
        });
    
        if (isPlayerOrEnemyBlocked) {
            console.log(`Blocked by player or enemy at (${x}, ${y}).`);
            return true;
        }
    
        return false;
    }
    
};
