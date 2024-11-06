// overlayMap.js

import buildingSelectionModule from '../gameInterface/buildingSelectionModule.js';

const overlayMapModule = {
    buildingsCoordinates: [],

    init: function() {
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'overlayContainer';
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = 0;
        overlayContainer.style.left = 0;
        overlayContainer.style.width = '100%';
        overlayContainer.style.height = '100%';
        document.getElementById('mapContainer').appendChild(overlayContainer);

        // Запрос карты с сервера при инициализации
        window.socket.emit('requestOverlayMap');
        console.log('Overlay map initialized');
    },

    placeBuilding: function(x, y, building) {
        // Отправляем запрос на сервер для размещения постройки
        window.socket.emit('placeBuilding', { x, y, building });
    },

    renderBuildings: function(buildings) {
        const overlayContainer = document.getElementById('overlayContainer');
        if (!overlayContainer) {
            console.error('Overlay container not found. Make sure overlayMapModule.init() was called.');
            return;
        }
        overlayContainer.innerHTML = ''; // Очищаем контейнер перед рендерингом

        buildings.forEach(({ x, y, width, height, name }) => {
            const buildingElement = document.createElement('div');
            buildingElement.className = `building-overlay ${name}`;
            buildingElement.style.position = 'absolute';
            buildingElement.style.width = `${width * 10}px`;
            buildingElement.style.height = `${height * 10}px`;
            buildingElement.style.left = `${x * 10}px`;
            buildingElement.style.top = `${y * 10}px`;

            buildingElement.addEventListener('click', () => {
                buildingSelectionModule.selectBuilding(buildingElement, name);
            });

            overlayContainer.appendChild(buildingElement);
        });
    },

    clearBuildings: function() {
        window.socket.emit('clearOverlayMap'); // Очищаем карту на сервере
        this.buildingsCoordinates = [];
    },
};

// Обработчики событий от сервера
window.socket.on('loadOverlayMap', (buildings) => {
    overlayMapModule.renderBuildings(buildings);
});

window.socket.on('updateOverlayMap', (buildings) => {
    overlayMapModule.renderBuildings(buildings);
});

window.socket.on('placementFailed', (data) => {
    console.log(`Cannot place building at (${data.x}, ${data.y}): Position is blocked.`);
});

export default overlayMapModule;
