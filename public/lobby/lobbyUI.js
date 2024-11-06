
import controlsModule from '../controls.js';
import buildingSelectionModule from '../gameInterface/buildingSelectionModule.js';
import enemyReceiverModule from '../enemyReceiverModule.js';
import enemyRendererModule from '../enemyRendererModule.js';
import buildingCheck from '../buildCheck.js';
import overlayMapModule from '../playingMap/overlayMap.js';
const lobbyUI = {
    selectedMap: null,

    // Функция для выбора карты
    selectMap: function(mapData) {
        console.log("Карта выбрана:", mapData);
        this.selectedMap = mapData;
        window.gameCore.lobby.selectedMap = mapData; // Сохраняем карту в gameCore
        this.uploadMapToServer(mapData); // Загружаем карту на сервер
    },

    uploadMapToServer: function(mapData) {
        const roomName = window.gameCore.lobby.roomName;  // Получаем roomName
        console.log('Uploading custom map to server...');
        window.socket.emit('uploadMap', { roomName, data: mapData }); // Отправка карты с roomName
    },
    
    init: function() {
        document.getElementById('readyButton').addEventListener('click', () => lobbyActions.onReady());
        document.getElementById('exitLobby').addEventListener('click', () => lobbyActions.returnToMainMenu());
    },

    enterLobby: function(roomName) {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('lobby').style.display = 'block';
        document.getElementById('lobbyRoomName').textContent = roomName;
    },

    updatePlayerList: function(players) {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name + (player.isReady ? ' (Ready)' : '');
            playerList.appendChild(li);
        });
    },

    startCountdown: function() {
        let countdown = 2;
        console.log('All players ready. Starting countdown.');
        const lobbyMessages = document.getElementById('lobbyMessages');
        lobbyMessages.textContent = `Game starting in ${countdown}...`;

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                lobbyMessages.textContent = `Game starting in ${countdown}...`;
            } else {
                clearInterval(countdownInterval);
                socket.emit('startGame', { roomName: gameCore.lobby.roomName });
            }
        }, 1000);
    },

async onGameStarted() {
        console.log('The game has started! Handling game start.');
        
        gameCore.updateGameSettings({ isGameActive: true });
        
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('mapContainer').style.display = 'block';
        
            
        if (typeof mapModule !== 'undefined') {
            console.log('Инициализация карты...');
            await mapModule.init(); // Просто вызываем инициализацию карты, сервер решит, какую карту отправить
        }
        overlayMapModule.init();
        if (typeof buildingManager !== 'undefined') {
            buildingManager.init(socket, this.roomName, buildingSyncClient);
        }
        if (typeof socket !== 'undefined') {
            enemyReceiverModule.init(socket); // Инициализируем прием данных о врагах
        }
        setInterval(() => {
            enemyRendererModule.update();
        }, 500);
        if (typeof playerPositionModule !== 'undefined') {
            playerPositionModule.init();
        }
        if (typeof cameraModule !== 'undefined') {
            cameraModule.init();
        }
        if (typeof playerAttributesModule !== 'undefined') {
            playerAttributesModule.initializeAttributes();
        }
        if (typeof bottomInterfaceModule !== 'undefined') {
            bottomInterfaceModule.showInterface(); 
        }
        if (typeof topInterfaceModule !== 'undefined') {
            topInterfaceModule.showInterface(); 
        }

        if (typeof gameTimerModule !== 'undefined') {
            gameTimerModule.start(); // Запуск таймера при старте игры
        }
        if (typeof playerResourcesModule !== 'undefined') {
            playerResourcesModule.initializeResources(); // Инициализация модуля ресурсов
        }
        buildingSelectionModule.init();
        controlsModule.init();
        buildingCheck.initializeBuildCheckListeners(); 
    }
    
};

export default lobbyUI;
