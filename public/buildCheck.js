const buildingCheck = {
    requestBuild: function(buildingName, size) {
        console.log("Запрос на проверку постройки с именем:", buildingName);
        socket.emit('requestBuild', { buildingName, size });
    },

    confirmBuild: function(building, x, y) {
        console.log("Подтверждение постройки для:", building.name);
        socket.emit('confirmBuild', { buildingName: building.name, x, y, size: building.size });
    },

    initializeBuildCheckListeners: function() {
        if (!window.socket) {
            console.error("Socket не инициализирован");
            return;
        }

        console.log("Инициализация прослушивания событий для строительства");
        
        socket.on('buildCheckSuccess', ({ building, size }) => {
            console.log('Проверка постройки успешна:', building);
            mapModule.buildingManager.startGhostPlacement(building);
        });

        socket.on('buildCheckFailure', ({ message }) => {
            alert(`Cannot build: ${message}`);
        });

        socket.on('buildConfirmSuccess', ({ building, x, y }) => {
            console.log('Подтверждение постройки успешно', building, x, y);

        });
        
        socket.on('placeBuilding', ({ building, x, y }) => {
            console.log('Получено событие placeBuilding:', building, x, y);
            
            // Создаем объект `building` с правильными значениями из данных сервера
            const constructedBuilding = {
                name: building.name,
                size: building.size
            };
            
            mapModule.buildingManager.placeBuilding(x, y, constructedBuilding);
        });
        

        socket.on('buildConfirmFailure', ({ message }) => {
            alert(`Cannot place building: ${message}`);
        });
    }
};

// Инициализация прослушивания событий после полной загрузки страницы
window.addEventListener('load', () => {
    if (window.socket) {
        buildingCheck.initializeBuildCheckListeners();
    } else {
        console.error("Socket не найден при загрузке страницы.");
    }
});
