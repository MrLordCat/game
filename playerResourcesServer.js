// playerResourcesServer.js

const playersResources = {}; // Хранит ресурсы каждого игрока по их socket.id

// Инициализация ресурсов для нового игрока
function initializeResources() {
    return {
        gold: 1000,
        wood: 1000,
        food: { current: 0, max: 100 }
    };
}

// Функция для обработки обновления ресурсов
function updateResources(socket, resources) {
    if (playersResources[socket.id]) {
        playersResources[socket.id] = { ...playersResources[socket.id], ...resources };
        socket.emit('updateResources', playersResources[socket.id]);
    }
}

// Получение ресурсов игрока по socket.id
function getResources(socketId) {
    return playersResources[socketId] || initializeResources();
}

module.exports = (io) => {
    io.on('connection', (socket) => {
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
    });
};

module.exports.getResources = getResources;
module.exports.updateResources = updateResources;
