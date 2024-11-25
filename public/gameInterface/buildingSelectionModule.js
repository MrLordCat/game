import bottomInterfaceModule from './bottomInterface.js';

const buildingSelectionModule = {
    selectedBuilding: null,
    selectedBuildingId: null,

    init: function() {
        console.log("Building selection module initialized");

        document.getElementById('mapContainer').addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('player')) {
                
                this.deselectBuilding();
            }
        });
    },

    selectBuilding: function(buildingElement, buildingId) {
        this.deselectBuilding();

        this.selectedBuilding = buildingElement;
        this.selectedBuildingId = buildingId;
        this.selectedBuilding.classList.add('selected-building');

        const buildingData = window.gameCore.playerBuildings[buildingId];
        if (buildingData) {
            console.log(`Получены данные для здания ${buildingId} из gameCore:`, buildingData);
            bottomInterfaceModule.showInterface();
            bottomInterfaceModule.updateBuildingInfo({
                health: buildingData.health,
                armor: buildingData.armor,
                hasMenu: buildingData.hasMenu,
            });
        } else {
            console.error(`Building data for ID ${buildingId} not found in gameCore.`);
        }
    },

    deselectBuilding: function() {
        if (this.selectedBuilding) {
            this.selectedBuilding.classList.remove('selected-building');
            this.selectedBuilding = null;
        }
        this.selectedBuildingId = null;
        bottomInterfaceModule.resetInterface();
    }
};

// Обработчик обновлений данных здания в реальном времени
window.socket.on('buildingDataUpdated', (buildingData) => {
    console.log("Обновлены данные о здании:", buildingData);

    // Обновляем данные здания в gameCore
    if (buildingData.buildingId) {
        window.gameCore.updatePlayerBuildings({
            [buildingData.buildingId]: buildingData,
        });
    }

    // Если это выбранное здание, обновляем интерфейс
    if (buildingSelectionModule.selectedBuildingId === buildingData.buildingId) {
        bottomInterfaceModule.updateBuildingInfo({
            health: buildingData.health,
            armor: buildingData.armor,
            hasMenu: buildingData.hasMenu,
        });
    }
});

window.buildingSelectionModule = buildingSelectionModule;

export default buildingSelectionModule;
