// buildingSelectionModule.js

import bottomInterfaceModule from './bottomInterface.js';

const buildingSelectionModule = {
    selectedBuilding: null,

    init: function() {
        console.log("Building selection module initialized");
    },

    selectBuilding: function(buildingElement, buildingId) {
        this.deselectBuilding();
    
        this.selectedBuilding = buildingElement;
        this.selectedBuilding.classList.add('selected-building');
    
        console.log(`Запрашиваем данные для здания с ID: ${buildingId}`);
        window.socket.emit('requestBuildingData', { buildingId });
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
