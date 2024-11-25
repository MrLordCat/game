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


window.socket.on('buildingDataUpdated', (buildingData) => {
    // Обновляем данные здания в gameCore
    if (buildingData.buildingId) {
        window.gameCore.updatePlayerBuildings({
            [buildingData.buildingId]: buildingData,
        });

        // Добавляем или обновляем элемент здоровья в overlayMap
        const buildingElement = document.querySelector(`[data-building-id="${buildingData.buildingId}"]`);
        if (buildingElement) {
            let healthBarContainer = buildingElement.querySelector('.health-bar-container');
            if (!healthBarContainer) {
                // Если контейнер для полосы здоровья отсутствует, создаём его
                healthBarContainer = document.createElement('div');
                healthBarContainer.className = 'health-bar-container';
                healthBarContainer.style.position = 'absolute';
                healthBarContainer.style.width = `${buildingData.width * 10}px`;
                healthBarContainer.style.height = '5px';
                healthBarContainer.style.top = '-10px';
                healthBarContainer.style.left = '0';
                buildingElement.appendChild(healthBarContainer);

                const healthBar = document.createElement('div');
                healthBar.className = 'health-bar';
                healthBar.style.height = '100%';
                healthBarContainer.appendChild(healthBar);
            }

            // Обновляем данные здоровья
            const healthBar = healthBarContainer.querySelector('.health-bar');
            const healthPercentage = (buildingData.health / buildingData.maxHealth) * 100;
            healthBar.style.width = `${healthPercentage}%`;
            healthBar.style.backgroundColor = healthPercentage > 50 ? 'green' : healthPercentage > 20 ? 'yellow' : 'red';

        }
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
