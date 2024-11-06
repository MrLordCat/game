// map.js

const mapModule = {
    mapData: [],
    mapWidth: 100,
    mapHeight: 100,

    init: function() {
        console.log('Map module initialized');
        
        // Проверяем, выбрана ли пользовательская карта в gameCore и загружаем её
        if (window.gameCore.lobby.selectedMap) {
            console.log('Загрузка пользовательской карты из gameCore');
            this.loadCustomMap(window.gameCore.lobby.selectedMap);
        } else {
            this.generateMap();  // Иначе создаём сгенерированную карту
        }
        
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
    },

    generateMap: function() {
        this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y][0] = 1;
            this.mapData[y][this.mapWidth - 1] = 1;
        }
        for (let x = 0; x < this.mapWidth; x++) {
            this.mapData[0][x] = 1;
            this.mapData[this.mapHeight - 1][x] = 1;
        }
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
        
                if (this.mapData[y][x] === 1) {
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
