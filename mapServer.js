// mapServer.js

let customMapData = null; // Переменная для хранения загруженной карты

module.exports = (socket) => {
    // Обработка события загрузки карты от клиента
    socket.on('uploadMap', (mapData) => {
        console.log("Received custom map from client:", JSON.stringify(mapData));
        customMapData = convertMapFormat(mapData); // Конвертируем пользовательскую карту
        console.log("Converted map format:");
    });

    // Обработка события запроса карты
    socket.on('requestMap', () => {
        console.log("Received request for map from client.");
        
        // Если загружена пользовательская карта, отправляем её
        if (customMapData) {
            socket.emit('loadMap', customMapData);
            console.log("Отправляем карту:");
        } else {
            // Если пользовательская карта не загружена, отправляем стандартную карту
            const mapData = generateDefaultMap();
            socket.emit('loadMap', mapData);
            console.log("Default map sent to client.");
        }
    });
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
function convertMapFormat(mapData) {
    console.log("Starting map conversion...");
    const convertedMap = mapData.map(row => 
        row.map(cell => cell === 1 ? { type: 'wall' } : { type: 'passage' })
    );
    console.log("Converted map:");
    return convertedMap;
}
