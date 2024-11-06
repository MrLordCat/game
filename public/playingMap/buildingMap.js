// buildingMap.js

import overlayMapModule from './overlayMap.js';
import mapModule from './map.js';
import buildingCheck from '../buildCheck.js'; // Импорт buildingCheck

mapModule.buildingManager = {
    init: function() {
        overlayMapModule.init();  // Инициализация слоя для построек
        console.log('Building Manager initialized');
    },

    startGhostPlacement: function(building) {
        const ghostBuilding = document.createElement('div');
        ghostBuilding.className = `ghost-building ${building.name}`;
        ghostBuilding.style.position = 'absolute';
        ghostBuilding.style.width = `${building.size.width * 10}px`;
        ghostBuilding.style.height = `${building.size.height * 10}px`;
        ghostBuilding.style.opacity = '0.5';
        document.body.appendChild(ghostBuilding);

        const mapContainer = document.getElementById('mapContainer');
        const containerRect = mapContainer.getBoundingClientRect();

        // Отключаем pointer-events для overlayContainer и enemyContainer
        const overlayContainer = document.getElementById('overlayContainer');
        const enemyContainer = document.getElementById('enemyContainer');
        overlayContainer.style.pointerEvents = 'none';
        enemyContainer.style.pointerEvents = 'none';

        mapContainer.addEventListener('mousemove', (event) => {
            const target = event.target;
            if (target.classList.contains('map-cell')) {
                let x = parseInt(target.dataset.x, 10);
                let y = parseInt(target.dataset.y, 10);

                // Ограничение по горизонтали
                if (x + building.size.width > containerRect.width / 10) {
                    x = Math.floor(containerRect.width / 10 - building.size.width);
                }

                // Ограничение по вертикали
                if (y + building.size.height > containerRect.height / 10) {
                    y = Math.floor(containerRect.height / 10 - building.size.height);
                }

                ghostBuilding.style.left = `${containerRect.left + x * 10}px`;
                ghostBuilding.style.top = `${containerRect.top + y * 10}px`;
            }
        });

        mapContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('map-cell')) {
                let x = parseInt(target.dataset.x, 10);
                let y = parseInt(target.dataset.y, 10);

                // Применяем те же ограничения при клике, чтобы здание не вышло за границы
                if (x + building.size.width > containerRect.width / 10) {
                    x = Math.floor(containerRect.width / 10 - building.size.width);
                }
                if (y + building.size.height > containerRect.height / 10) {
                    y = Math.floor(containerRect.height / 10 - building.size.height);
                }

                buildingCheck.confirmBuild(building, x, y);
                ghostBuilding.remove();
            }
        }, { once: true });
    },


    placeBuilding: function(x, y, building) {
        console.log("Place Building map", x, y, building);
        overlayMapModule.placeBuilding(x, y, building);
    }
};

export default mapModule.buildingManager;
