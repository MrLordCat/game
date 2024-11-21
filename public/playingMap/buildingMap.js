// buildingMap.js

import overlayMapModule from './overlayMap.js';
import mapModule from './map.js';
import buildingCheck from '../buildCheck.js';

mapModule.buildingManager = {
    ghostBuilding: null,

    init: function() {
        overlayMapModule.init();  // Инициализация слоя для построек
        console.log('Building Manager initialized');

        // Обработка клавиши ESC для отмены призрака
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.ghostBuilding) {
                this.cancelGhostPlacement();
            }
        });
    },

    startGhostPlacement: function(building) {
        this.cancelGhostPlacement(); // Отменяем старый призрак, если он есть

        this.ghostBuilding = document.createElement('div');
        this.ghostBuilding.className = `ghost-building ${building.name}`;
        this.ghostBuilding.style.position = 'absolute';
        this.ghostBuilding.style.width = `${building.size.width * 10}px`;
        this.ghostBuilding.style.height = `${building.size.height * 10}px`;
        this.ghostBuilding.style.opacity = '0.5';
        document.body.appendChild(this.ghostBuilding);

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

                this.ghostBuilding.style.left = `${containerRect.left + x * 10}px`;
                this.ghostBuilding.style.top = `${containerRect.top + y * 10}px`;
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
                this.cancelGhostPlacement();
            }
        }, { once: true });

        // Обработчик для правого клика для отмены призрака
        mapContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.cancelGhostPlacement();
        }, { once: true });
    },

    cancelGhostPlacement: function() {
        if (this.ghostBuilding) {
            this.ghostBuilding.remove();
            this.ghostBuilding = null;
            console.log("Building ghost placement canceled");

            // Восстанавливаем pointer-events
            document.getElementById('overlayContainer').style.pointerEvents = '';
            document.getElementById('enemyContainer').style.pointerEvents = '';
        }
    },

    placeBuilding: function(x, y, building) {
        const ownerId = window.gameCore.lobby.playerName; // Используем текущего игрока как владельца
        const buildingWithOwner = { ...building, ownerId };
        console.log("Placing building:", buildingWithOwner);
        overlayMapModule.placeBuilding(x, y, buildingWithOwner);
    }
};

export default mapModule.buildingManager;
