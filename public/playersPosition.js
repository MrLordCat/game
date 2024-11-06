// playersPosition.js
window.playerPosition = { x: 50, y: 50 }; 
const playerPositionModule = {
    playerElement: null,
    otherPlayers: {},
    playerSize: 1,
    playerPosition: { x: 50, y: 50 },
    isGameActive: false,

    init: function() {
        console.log('Initializing player position...');
        this.createPlayer();
        this.updatePlayerPosition();
    },

    createPlayer: function() {
        this.playerElement = document.createElement('div');
        this.playerElement.className = 'player';
        document.getElementById('mapContainer').appendChild(this.playerElement);
        this.playerElement.addEventListener('click', () => {
            console.log('Player selected');
            window.buildingSelectionModule.deselectBuilding(); 
            window.bottomInterfaceModule.resetInterface(); 
        });
        window.socket.emit('requestPlayerAttributes', { roomName: lobby.roomName });
    },

    updatePlayerPosition: function() {
        const sizeInPixels = this.playerSize * 10;
        this.playerElement.style.width = `${sizeInPixels}px`;
        this.playerElement.style.height = `${sizeInPixels}px`;
        this.playerElement.style.position = 'absolute';
        this.playerElement.style.left = `${(this.playerPosition.x - this.playerSize / 2) * 10}px`;
        this.playerElement.style.top = `${(this.playerPosition.y - this.playerSize / 2) * 10}px`;
console.log("sending player postion: ",  { roomName: lobby.roomName, position: this.playerPosition })
        window.socket.emit('updatePosition', { roomName: lobby.roomName, position: this.playerPosition });
    },

    updateOtherPlayers: function(players) {
        if (!this.isGameActive) return;

        console.log('Updating other players:', players);

        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error('mapContainer not found');
            return;
        }

        for (const playerId in players) {
            if (playerId === socket.id) continue;

            const playerData = players[playerId];
            let otherPlayerElement = this.otherPlayers[playerId];

            if (!otherPlayerElement) {
                otherPlayerElement = document.createElement('div');
                otherPlayerElement.className = 'other-player';
                mapContainer.appendChild(otherPlayerElement);
                console.log(`Created new element for player ${playerId}`);
                this.otherPlayers[playerId] = otherPlayerElement;
            }

            const sizeInPixels = this.playerSize * 10;
            otherPlayerElement.style.width = `${sizeInPixels}px`;
            otherPlayerElement.style.height = `${sizeInPixels}px`;
            otherPlayerElement.style.position = 'absolute';
            otherPlayerElement.style.left = `${(playerData.position.x - this.playerSize / 2) * 10}px`;
            otherPlayerElement.style.top = `${(playerData.position.y - this.playerSize / 2) * 10}px`;
            console.log(`Updated position for player ${playerId} to x: ${playerData.position.x}, y: ${playerData.position.y}`);
        }

        for (const playerId in this.otherPlayers) {
            if (!players[playerId]) {
                this.otherPlayers[playerId].remove();
                delete this.otherPlayers[playerId];
                console.log(`Removed element for player ${playerId}`);
            }
        }
    }
};

// Обработчики для обновления позиций игроков
window.socket.on('gameStarted', () => {
    playerPositionModule.isGameActive = true;
    playerPositionModule.init();
    console.log('Game has started - player initialized');
});

window.socket.on('updatePlayers', (players) => {
    playerPositionModule.updateOtherPlayers(players);
});

// Делаем playerPositionModule глобальным
window.playerPositionModule = playerPositionModule;
