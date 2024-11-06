const cameraModule = {
    mapElement: null,
    cameraSpeed: 4, // Скорость движения камеры
    mapWidth: 4000, // Ширина карты
    mapHeight: 4000, // Высота карты
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    cameraX: 0,
    cameraY: 0,
    keysPressed: {}, // Объект для отслеживания нажатых клавиш

    init: function() {
        console.log('Camera module initialized');
        this.mapElement = document.getElementById('mapContainer');
        this.updateCameraPosition();

        // Добавляем обработчики нажатия и отпускания клавиш
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.startCameraLoop(); // Запуск цикла для постоянного обновления камеры
    },

    handleKeyDown: function(event) {
        // Запоминаем нажатие клавиши
        this.keysPressed[event.key] = true;
    },

    handleKeyUp: function(event) {
        // Убираем из объекта клавишу при отпускании
        this.keysPressed[event.key] = false;
    },

    startCameraLoop: function() {
        const moveSpeed = this.cameraSpeed;

        const update = () => {
            // Проверяем, какие клавиши нажаты, и обновляем позицию камеры
            if (this.keysPressed['w']) this.cameraY = Math.max(this.cameraY - moveSpeed, 0); // Вверх
            if (this.keysPressed['s']) this.cameraY = Math.min(this.cameraY + moveSpeed, this.mapHeight - this.viewportHeight); // Вниз
            if (this.keysPressed['a']) this.cameraX = Math.max(this.cameraX - moveSpeed, 0); // Влево
            if (this.keysPressed['d']) this.cameraX = Math.min(this.cameraX + moveSpeed, this.mapWidth - this.viewportWidth); // Вправо

            // Применяем новое положение камеры
            this.updateCameraPosition();

            // Вызываем следующий кадр
            requestAnimationFrame(update);
        };
        
        // Запускаем цикл обновления
        update();
    },

    updateCameraPosition: function() {
        this.mapElement.style.transform = `translate(-${this.cameraX}px, -${this.cameraY}px)`;
    }
};

window.cameraModule = cameraModule;
window.addEventListener('load', () => {
    cameraModule.init();
});
