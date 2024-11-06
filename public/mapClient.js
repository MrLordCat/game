// mapClient.js
const mapClient = {
    init: function(socket) {
        // Обработчик для получения пользовательской карты
        socket.on('receiveCustomMap', (mapData) => {
            console.log('Received custom map data:', mapData);
            lobby.selectedMap = mapData; // Доступ к `lobby` через глобальную переменную
            alert('Custom map loaded for all players!');
        });
    },

    uploadCustomMap: function(mapData, roomName) {
        socket.emit('uploadCustomMap', { mapData, roomName });
    }
};

// Делаем `mapClient` глобально доступным
window.mapClient = mapClient;
