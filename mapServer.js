// mapServer.js

const { updateMapData } = require('./playerMovementServer'); // Подключаем updateMapData напрямую

const roomMaps = {}; // Хранение карт по комнатам

module.exports = (socket, io) => {
    // Загрузка пользовательской карты для конкретной комнаты
    socket.on('uploadMap', ({ roomName, data }) => {
        console.log(`Received custom map for room ${roomName}`);
        roomMaps[roomName] = convertMapFormat(data);
        updateMapData(roomName, roomMaps[roomName]); // Напрямую обновляем карту в playerMovementServer
    });


    // Запрос карты от клиента
    socket.on('requestMap', ({ roomName }) => {
        console.log(`Received map request from client in room ${roomName}`);
        const mapData = roomMaps[roomName] || generateDefaultMap();
        socket.emit('loadMap', mapData);
        updateMapData(roomName, mapData);
    });
};

// Генерация карты по умолчанию
function generateDefaultMap() {
    const mapWidth = 100;
    const mapHeight = 100;
    const mapData = Array(mapHeight).fill().map(() => Array(mapWidth).fill({ type: 'passage' }));

    for (let y = 0; y < mapHeight; y++) {
        mapData[y][0] = { type: 'wall' };
        mapData[y][mapWidth - 1] = { type: 'wall' };
    }
    for (let x = 0; x < mapWidth; x++) {
        mapData[0][x] = { type: 'wall' };
        mapData[mapHeight - 1][x] = { type: 'wall' };
    }

    return mapData;
}

// Преобразование пользовательской карты в нужный формат
function convertMapFormat(data) {
    return data.map(row => row.map(cell => cell === 1 ? { type: 'wall' } : { type: 'passage' }));
}
module.exports.clearMap = (roomName) => {
    roomMaps[roomName] = generateDefaultMap();
    updateMapData(roomName, roomMaps[roomName]);
    console.log(`Map reset to default for room ${roomName}`);
};
// Функция для получения текущей карты для конкретной комнаты
module.exports.getRoomMap = (roomName) => roomMaps[roomName] || generateDefaultMap();
