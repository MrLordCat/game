// playerAttributes.js

const playerData = require('./playerDataModule');

function handleAttributes(socket) {
    // При подключении атрибуты уже инициализированы в playerDataModule
    socket.on('requestAttributes', () => {
        socket.emit('updateAttributes', playerData.getAttributes(socket.id));
    });

    socket.on('modifyAttributes', (attrUpdates) => {
        const attrs = playerData.updateAttributes(socket.id, attrUpdates);
        socket.emit('updateAttributes', attrs);
    });
}

module.exports = {
    handleAttributes
};
