// playerResources.js

const playerResourcesModule = {
    initializeResources: function() {
        console.log('Initializing player resources...');

        // Начинаем слушать обновления ресурсов после запроса
        window.socket.on('updateResources', (resources) => {
            console.log("Received player resources:", resources);
            gameCore.updateResources(resources); // Обновляем ресурсы в gameCore
        });

        // Запрашиваем начальные ресурсы у сервера
        window.socket.emit('requestResources', { roomName: gameCore.lobby.roomName });
    },

    modifyResources: function(newResources) {
        // Отправляем изменения ресурсов на сервер
        window.socket.emit('modifyResources', newResources);
    }
};

// Запускаем инициализацию ресурсов при старте игры
window.socket.on('gameStarted', () => {
    playerResourcesModule.initializeResources();
});
