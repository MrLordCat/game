// playerMovementServer.js

const players = {}; 
const moveIntervals = {}; 
let mapData = []; 
let overlayMapData = []; 

function updateMapData(newMapData) {
    mapData = newMapData;
    console.log("Map data in playerMovementServer updated.");
}

function updateOverlayData(newOverlayMapData) {
    overlayMapData = newOverlayMapData;
    console.log("Overlay map data in playerMovementServer updated.");
}

function handlePlayerMovement(socket, io) {
    socket.on('initializePlayer', () => {
        players[socket.id] = { x: 50, y: 50 };
        io.emit('updatePlayers', players);
    });

    socket.on('setTargetPosition', (targetPosition) => {
        const player = players[socket.id];
        if (!player) return;

        if (moveIntervals[socket.id]) {
            clearInterval(moveIntervals[socket.id]);
        }

        moveIntervals[socket.id] = movePlayerToTarget(socket, io, player, targetPosition);
    });

    socket.on('disconnect', () => {
        clearInterval(moveIntervals[socket.id]);
        delete moveIntervals[socket.id];
        delete players[socket.id];
        io.emit('updatePlayers', players);
        console.log(`Player ${socket.id} disconnected and removed from players list.`);
    });
}

// Функция для проверки, является ли клетка стеной или содержит здание
function isWall(x, y) {
    if (y >= 0 && y < mapData.length && x >= 0 && x < mapData[0].length) {
        if (mapData[y][x].type === 'wall') return true;
    }

    return overlayMapData.some(building => {
        return (
            x >= building.x &&
            x < building.x + building.width &&
            y >= building.y &&
            y < building.y + building.height
        );
    });
}

function movePlayerToTarget(socket, io, player, targetPosition) {
    return setInterval(() => {
        const nextX = player.x + Math.sign(targetPosition.x - player.x);
        const nextY = player.y + Math.sign(targetPosition.y - player.y);

        if (isWall(nextX, nextY)) {
            clearInterval(moveIntervals[socket.id]);
            delete moveIntervals[socket.id];
            return;
        }

        player.x = nextX;
        player.y = nextY;

        if (player.x === targetPosition.x && player.y === targetPosition.y) {
            clearInterval(moveIntervals[socket.id]);
            delete moveIntervals[socket.id];
            return;
        }

        io.emit('updatePlayers', players);
    }, 200);
}

module.exports = {
    handlePlayerMovement,
    updateMapData,
    updateOverlayData,
    isWall 
};
