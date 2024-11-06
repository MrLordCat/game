// playersPosition.js

const playerPositionModule = {
    playerElement: null,
    otherPlayers: {},
    playerSize: 1,
    isInitialized: false, // Флаг для предотвращения повторных подписок

    init: function() {
        console.log('Initializing player position...');
        if (!this.isInitialized) {
            this.setupEventListeners(); // Устанавливаем подписки только один раз
            this.isInitialized = true;
        }
        this.createPlayer();
    },

    createPlayer: function() {
        this.playerElement = document.createElement('div');
        this.playerElement.className = 'player';
        document.getElementById('mapContainer').appendChild(this.playerElement);
        
        window.socket.emit('initializePlayer'); // Инициализация игрока на сервере
    },

    setupEventListeners: function() {
        // Обработчик для обновления позиций игроков
        window.socket.on('gameStarted', () => {
            this.init();
            console.log('Game has started - player initialized');
        });

        // Обработчик для обновления позиций всех игроков
        window.socket.on('updatePlayers', (players) => {
            if (window.gameCore.gameSettings.isGameActive) { // Проверка isGameActive из gameCore
                this.updateOtherPlayers(players);
                if (players[window.socket.id]) {
                    this.updatePlayerPosition(players[window.socket.id]);
                }
            }
        });
    },

    updatePlayerPosition: function(position) {
        if (!window.gameCore.gameSettings.isGameActive || !this.playerElement) return;
    
        // Обновление позиции главного игрока без смещения на половину клетки
        this.playerElement.style.position = 'absolute';
        this.playerElement.style.left = `${position.x * 10}px`;
        this.playerElement.style.top = `${position.y * 10}px`;
    },
    

    updateOtherPlayers: function(players) {
        if (!window.gameCore.gameSettings.isGameActive) return;
    
        console.log('Updating other players:', players);
    
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error('mapContainer not found');
            return;
        }
    
        const playerId = window.gameCore.playerId; // Предполагается, что у вас есть идентификатор текущего игрока
    
        for (const otherPlayerId in players) {
            // Пропускаем самого себя
            if (otherPlayerId === playerId) continue;
    
            const playerData = players[otherPlayerId];
            let otherPlayerElement = this.otherPlayers[otherPlayerId];
    
            if (!otherPlayerElement) {
                otherPlayerElement = document.createElement('div');
                otherPlayerElement.className = 'other-player';
                mapContainer.appendChild(otherPlayerElement);
                this.otherPlayers[otherPlayerId] = otherPlayerElement;
            }
    
            const sizeInPixels = this.playerSize * 10;
            otherPlayerElement.style.width = `${sizeInPixels}px`;
            otherPlayerElement.style.height = `${sizeInPixels}px`;
            otherPlayerElement.style.position = 'absolute';
            otherPlayerElement.style.left = `${playerData.x * 10}px`;
            otherPlayerElement.style.top = `${playerData.y * 10}px`;
        }
    }
    
};

window.playerPositionModule = playerPositionModule;
export default playerPositionModule;
