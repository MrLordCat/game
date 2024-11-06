// overlayMapServer.js

const overlayMapData = []; // Хранение информации о координатах построек
const buildingModule = require('./buildingModule'); // Импорт buildingModule

module.exports = (socket, io, updateOverlayMap) => {
    socket.on('requestOverlayMap', () => {
        socket.emit('loadOverlayMap', overlayMapData);
        console.log('Overlay map data sent to client.');
    });

    socket.on('placeBuilding', (data) => {
        const { x, y, building } = data;

        if (isPositionBlocked(x, y, building.size)) {
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

    function isPositionBlocked(x, y, size) {
        return overlayMapData.some(building => {
            return (
                x < building.x + building.width &&
                x + size.width > building.x &&
                y < building.y + building.height &&
                y + size.height > building.y
            );
        });
    }
};
