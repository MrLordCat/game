const buildingCheck = {
    requestBuild: function(buildingName, size) {
        console.log("Запрос на проверку постройки с именем:", buildingName);
        if (window.socket) {
            window.socket.emit('requestBuild', { buildingName, size });
        } else {
            console.error("Socket не инициализирован для запроса на проверку постройки.");
        }
    },

    confirmBuild: function(building, x, y) {
        console.log("Подтверждение постройки для:", building.name);
        if (window.socket) {
            window.socket.emit('confirmBuild', { buildingName: building.name, x, y, size: building.size });
        } else {
            console.error("Socket не инициализирован для подтверждения постройки.");
        }
    },

    initializeBuildCheckListeners: function() {
        if (!window.socket) {
            console.error("Socket не инициализирован");
            return;
        }

        console.log("Инициализация прослушивания событий для строительства");

        window.socket.on('buildCheckSuccess', ({ building, size }) => {
            console.log('Проверка постройки успешна:', building);
            mapModule.buildingManager.startGhostPlacement(building);
        });

        window.socket.on('buildCheckFailure', ({ message }) => {
            alert(`Cannot build: ${message}`);
        });

        window.socket.on('buildConfirmSuccess', ({ building, x, y }) => {
            console.log('Подтверждение постройки успешно', building, x, y);
        });

        window.socket.on('placeBuilding', ({ building, x, y }) => {
            console.log('Получено событие placeBuilding:', building, x, y);

            const constructedBuilding = {
                name: building.name,
                size: building.size
            };

            mapModule.buildingManager.placeBuilding(x, y, constructedBuilding);
        });

        window.socket.on('buildConfirmFailure', ({ message }) => {
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

export default buildingCheck;
