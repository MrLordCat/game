// map.js

const mapModule = {
    mapData: [],
    mapWidth: 100,
    mapHeight: 100,

    init: async function() {
        console.log('Map module initialized');
        
        // Запрашиваем карту с сервера всегда, чтобы загрузить актуальную версию
        await this.generateMap();

        this.renderMap();
        this.buildingManager.init();
    },

    loadCustomMap: function(customMapData) {
        console.log('Загрузка пользовательской карты...');
        if (!customMapData || customMapData.length === 0) {
            console.error('Ошибка: customMapData пусто или некорректно.');
            return;
        }
        this.mapData = customMapData;  // Заменяем карту на пользовательскую
        this.mapWidth = customMapData[0].length;
        this.mapHeight = customMapData.length;
        console.log('Ширина карты:', this.mapWidth, 'Высота карты:', this.mapHeight);
        this.renderMap();
        this.buildingManager.init();
        console.log('Map loaded');
    },

    generateMap: function() {
        return new Promise((resolve) => {
            console.log('Запрос карты с сервера...');
            window.socket.emit('requestMap'); // Отправляем запрос на сервер
            window.socket.on('loadMap', (serverMapData) => {
                if (serverMapData && serverMapData.length > 0) {
                    this.mapData = serverMapData;
                    this.mapWidth = serverMapData[0].length;
                    this.mapHeight = serverMapData.length;
                    console.log('Карта получена от сервера и загружена.');
                    resolve();
                } else {
                    console.error('Ошибка: полученные данные карты некорректны.');
                    resolve(); // Завершаем даже в случае ошибки, чтобы избежать зависания
                }
            });
        });
    },

    renderMap: function() {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.innerHTML = '';

        for (let y = 0; y < this.mapHeight; y++) {
            const row = document.createElement('div');
            row.className = 'map-row';
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
        
                if (this.mapData[y][x].type === 'wall') {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('passage');
                }
        
                row.appendChild(cell);
            }
            mapContainer.appendChild(row);
        }
    },

    buildingManager: null
};

window.mapModule = mapModule;
export default mapModule;
