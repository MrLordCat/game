import movementModule from './movement.js';
import buildingSelectionModule from './gameInterface/buildingSelectionModule.js';

const controlsModule = {
    init: function() {
        console.log('Initializing controls...');
        this.setupMouseControls();
    },

    setupMouseControls: function() {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault();

            // Если режим починки включен, передаем обработку
            if (window.repairMode) {
                console.log("Repair mode active - handling building repair");
                const target = event.target;

                // Проверяем наличие атрибута data-building-id
                if (target.dataset.buildingId) {
                    const buildingId = target.dataset.buildingId;
                    console.log("Building ID: ", buildingId);
                    buildingSelectionModule.startRepair(buildingId);
                } else {
                    console.log("Target is not a building.");
                }
                return; // Прекращаем обработку перемещения
            }

            // Иначе выполняем перемещение
            const rect = mapContainer.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / 10);
            const y = Math.floor((event.clientY - rect.top) / 10);

            console.log(`Target position: x=${x}, y=${y}`);

            movementModule.setTargetPosition(x, y);
        });
    }
};

export default controlsModule;
