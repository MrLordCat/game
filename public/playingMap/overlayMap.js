// overlayMap.js

import buildingSelectionModule from '../gameInterface/buildingSelectionModule.js';

const overlayMapModule = {
    buildingsCoordinates: [],

    init: function() {
        const roomName = window.gameCore.lobby.roomName; // Получаем roomName из gameCore
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'overlayContainer';
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = 0;
        overlayContainer.style.left = 0;
        overlayContainer.style.width = '100%';
        overlayContainer.style.height = '100%';
        document.getElementById('mapContainer').appendChild(overlayContainer);

        window.socket.emit('requestOverlayMap', { roomName });
        console.log(`Overlay map initialized for room ${roomName}`);
    },

    placeBuilding: function(x, y, building) {
        const roomName = window.gameCore.lobby.roomName; // Используем roomName из gameCore
        window.socket.emit('placeBuilding', { x, y, building, roomName });
    },

    clearBuildings: function() {
        const roomName = window.gameCore.lobby.roomName; // Используем roomName из gameCore
        window.socket.emit('clearOverlayMap', { roomName });
        this.buildingsCoordinates = [];
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
    }
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
