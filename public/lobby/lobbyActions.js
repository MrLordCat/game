import lobbyUI from './lobbyUI.js';

const lobbyActions = {
    setupSocketEvents: function() {
        socket.on('roomCreated', this.onRoomCreated.bind(this));
        socket.on('playerJoined', lobbyUI.updatePlayerList);
        socket.on('allPlayersReady', lobbyUI.startCountdown);
        socket.on('gameStarted', lobbyUI.onGameStarted);

        // Обработчик выбора карты из списка
        document.getElementById('mapSelect').addEventListener('change', function(event) {
            const mapName = event.target.value;
            console.log("Выбрана карта:", mapName);
            // Если выбрана карта по умолчанию, очищаем пользовательскую карту
            const mapData = mapName === "Default Map" ? null : customMapData; // Здесь можно вставить логику получения карты по имени
            lobbyUI.selectMap(mapData);
        });

        // Обработчик загрузки пользовательской карты из файла
        document.getElementById('uploadMap').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const customMapData = JSON.parse(e.target.result);
                        console.log("Загружена пользовательская карта:", customMapData);
                        lobbyUI.selectMap(customMapData);
                    } catch (error) {
                        console.error("Ошибка загрузки карты:", error);
                    }
                };
                reader.readAsText(file);
            }
        });
    },

    createRoom: function(roomName) {
        const playerName = document.getElementById('playerName').value;
        gameCore.updateLobby({ roomName, playerName });
        socket.emit('createRoom', { roomName, playerName });
        lobbyUI.enterLobby(roomName);
    },

    joinRoom: function(roomName) {
        const playerName = document.getElementById('playerName').value;
        gameCore.updateLobby({ roomName, playerName });
        socket.emit('joinRoom', { roomName, playerName });
        lobbyUI.enterLobby(roomName);
    },

    onRoomCreated: function(roomName) {
        console.log(`Room created: ${roomName}. Automatically joining.`);
    },

    onReady: function() {
        console.log('Player is ready');
        socket.emit('playerReady');
    },

    returnToMainMenu: function() {
        console.log('Returning to main menu...');
        
        document.getElementById('mapContainer').style.display = 'none';
        document.getElementById('bottomInterface').style.display = 'none';
        document.getElementById('topInterface').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
        
        if (typeof bottomInterfaceModule !== 'undefined') {
            bottomInterfaceModule.hideInterface();
        }
        
        gameCore.updateGameSettings({ isGameActive: false });
        
        socket.emit('leaveRoom', { roomName: gameCore.lobby.roomName });
        gameCore.updateLobby({
            roomName: '',
            playerName: '',
            players: []
        });
    }
};

window.lobbyActions = lobbyActions;
export default lobbyActions;
