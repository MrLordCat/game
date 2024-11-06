
import movementModule from './movement.js';

const controlsModule = {
    init: function() {
        console.log('Initializing controls...');
        this.setupMouseControls();
    },

    setupMouseControls: function() {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const rect = mapContainer.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / 10);
            const y = Math.floor((event.clientY - rect.top) / 10);

            console.log(`Target position: x=${x}, y=${y}`);

            // Отправляем команду на перемещение
            movementModule.setTargetPosition(x, y);
        });
    }
};

export default controlsModule;
