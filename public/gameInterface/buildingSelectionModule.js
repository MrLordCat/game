// buildingSelectionModule.js

import bottomInterfaceModule from './bottomInterface.js';

const buildingSelectionModule = {
    selectedBuilding: null,
    init: function() {
        console.log("Building selection module initialized");

        // Обработчик для кликов на карте
        document.getElementById('mapContainer').addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('player')) {
                // Если кликнули на игрока, отменяем выбор здания
                this.deselectBuilding();
            }
        });
    },

    selectBuilding: function(buildingElement, buildingId) {
        this.deselectBuilding();

        this.selectedBuilding = buildingElement;
        this.selectedBuilding.classList.add('selected-building');

        // Получаем имя комнаты из gameCore и отправляем с запросом
        const roomName = window.gameCore.lobby.roomName;
        console.log(`Запрашиваем данные для здания с ID: ${buildingId} в комнате ${roomName}`);
        window.socket.emit('requestBuildingData', { roomName, buildingId });
    },

    deselectBuilding: function() {
        if (this.selectedBuilding) {
            this.selectedBuilding.classList.remove('selected-building');
            this.selectedBuilding = null;
        }
        bottomInterfaceModule.resetInterface();
    }
};

// Обработчик получения данных о здании от сервера
window.socket.on('buildingDataResponse', (buildingData) => {
    if (buildingData) {
        console.log("Получены данные о здании:", buildingData); // Логируем полученные данные
        bottomInterfaceModule.showInterface();
        bottomInterfaceModule.updateBuildingInfo({
            health: buildingData.health,
            armor: buildingData.armor,
            hasMenu: buildingData.hasMenu,
        });
    } else {
        console.error("Building data not found.");
    }
});

window.buildingSelectionModule = buildingSelectionModule;

export default buildingSelectionModule;
