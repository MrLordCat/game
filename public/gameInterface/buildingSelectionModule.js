// buildingSelectionModule.js

import bottomInterfaceModule from './bottomInterface.js';

const buildingSelectionModule = {
    selectedBuilding: null,
    hoveredBuilding: null,

    init: function() {
        console.log("Building selection module initialized");
    },

    selectBuilding: function(buildingElement, buildingId) {
        this.deselectBuilding();
    
        this.selectedBuilding = buildingElement;
        this.selectedBuilding.classList.add('selected-building');
    
        // Поиск здания в gameCore.playerBuildings по значению `name`
        const buildingData = Object.values(gameCore.playerBuildings).find(building => building.name === buildingId);
        
        if (buildingData) {
            // Обновляем интерфейс для здания с данными из gameCore
            bottomInterfaceModule.showInterface();
            bottomInterfaceModule.updateBuildingInfo({
                health: buildingData.health,
                armor: buildingData.armor
            });
        } else {
            console.error(`Building with ID ${buildingId} not found in gameCore`);
        }
    },

    deselectBuilding: function() {
        if (this.selectedBuilding) {
            this.selectedBuilding.classList.remove('selected-building');
            this.selectedBuilding = null;
        }
        bottomInterfaceModule.resetInterface(); // Возвращаем к интерфейсу игрока
    },

    hoverBuilding: function(buildingElement) {
        if (this.hoveredBuilding && this.hoveredBuilding !== this.selectedBuilding) {
            this.hoveredBuilding.classList.remove('hovered-building');
        }
        this.hoveredBuilding = buildingElement;
        this.hoveredBuilding.classList.add('hovered-building');
    },

    unhoverBuilding: function() {
        if (this.hoveredBuilding && this.hoveredBuilding !== this.selectedBuilding) {
            this.hoveredBuilding.classList.remove('hovered-building');
        }
        this.hoveredBuilding = null;
    }
};

window.buildingSelectionModule = buildingSelectionModule;

export default buildingSelectionModule;
