// playerResourcesServer.js

const playerData = require('./playerDataModule');

function handlePlayerResources(socket) {
    // Инициализируем данные игрока при подключении
    playerData.initializePlayerData(socket.id);
    socket.emit('updateResources', playerData.getResources(socket.id));

    socket.on('requestResources', () => {
        socket.emit('updateResources', playerData.getResources(socket.id));
    });

    socket.on('modifyResources', (newResources) => {
        playerData.updateResources(socket.id, newResources);
        socket.emit('updateResources', playerData.getResources(socket.id));
    });

    socket.on('disconnect', () => {
        playerData.deletePlayerData(socket.id);
    });
}

function getResources(socketId) {
    return playerData.getResources(socketId);
}

function updateResources(socket, resources) {
    playerData.updateResources(socket.id, resources);
    socket.emit('updateResources', playerData.getResources(socket.id));
}

function resetResources(socketId) {
    const player = playerData.getPlayerData(socketId);
    // Сбросим только ресурсы
    player.resources = {
        gold: 1000,
        wood: 1000,
        food: { current: 0, max: 100 }
    };
}

module.exports = {
    handlePlayerResources,
    getResources,
    updateResources,
    resetResources
};
