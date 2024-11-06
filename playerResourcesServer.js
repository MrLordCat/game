// playerResourcesServer.js

const playersResources = {}; // Хранит ресурсы каждого игрока по их socket.id

function initializeResources() {
    return {
        gold: 1000,
        wood: 1000,
        food: { current: 0, max: 100 }
    };
}

function updateResources(socket, resources) {
    if (playersResources[socket.id]) {
        playersResources[socket.id] = { ...playersResources[socket.id], ...resources };
        socket.emit('updateResources', playersResources[socket.id]);
    }
}

function handlePlayerResources(socket) {
    playersResources[socket.id] = initializeResources();
    socket.emit('updateResources', playersResources[socket.id]);

    socket.on('requestResources', () => {
        socket.emit('updateResources', playersResources[socket.id]);
    });

    socket.on('modifyResources', (newResources) => {
        updateResources(socket, newResources);
    });

    socket.on('disconnect', () => {
        delete playersResources[socket.id];
    });
}

// Функция для сброса ресурсов игрока к начальному значению
function resetResources(socketId) {
    playersResources[socketId] = initializeResources();
}

module.exports = {
    handlePlayerResources,
    getResources: (socketId) => playersResources[socketId] || initializeResources(),
    updateResources,
    resetResources
};
