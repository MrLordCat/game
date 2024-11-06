// mapServer.js

let customMapData = null; // Переменная для хранения пользовательской карты
let mapData = generateDefaultMap(); 
let updateMovementMap; // Переменная для функции обновления карты в модуле передвижения

module.exports = (socket, io, updateMapFunction) => {
    updateMovementMap = updateMapFunction; // Сохраняем функцию для обновления карты в модуле передвижения

    socket.on('uploadMap', (data) => {
        console.log("Received custom map from client:", JSON.stringify(data));
        customMapData = convertMapFormat(data); // Конвертируем пользовательскую карту
        console.log("Converted map format.");
        
        // Обновляем карту в модуле передвижения
        updateMovementMap(customMapData);
    });
    socket.on('clearMap', () => {
        customMapData = null;
        mapData = generateDefaultMap();
        updateMapFunction(mapData);
        console.log('Map reset to default.');
    });
    socket.on('requestMap', () => {
        console.log("Received request for map from client.");
        
        // Если загружена пользовательская карта, отправляем её
        if (customMapData) {
            socket.emit('loadMap', customMapData);
            console.log("Custom map sent to client.");
            updateMovementMap(customMapData); // Обновляем карту в модуле передвижения
        } else {
            socket.emit('loadMap', mapData);
            console.log("Default map sent to client.");
            updateMovementMap(mapData); // Обновляем карту в модуле передвижения
        }
    });
};
module.exports.clearMap = () => {
    customMapData = null;
    mapData = generateDefaultMap();
    updateMovementMap(mapData);
    console.log('Map cleared and reset to default by external call.');
};
// Функция для генерации стандартной карты
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

// Функция для преобразования пользовательской карты в нужный формат
function convertMapFormat(data) {
    console.log("Starting map conversion...");
    return data.map(row => row.map(cell => cell === 1 ? { type: 'wall' } : { type: 'passage' }));
}

module.exports.getCurrentMap = () => customMapData || mapData;
