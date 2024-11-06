const gameMenuModule = {
    menuVisible: false,

    init: function() {
        console.log('Game menu initialized');
        this.setupMenuElements();
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    },

    setupMenuElements: function() {
        const resumeButton = document.getElementById('resumeButton');
        const mainMenuButton = document.getElementById('mainMenuButton');

        // Привязка обработчиков событий к кнопкам
        resumeButton.addEventListener('click', this.hideMenu.bind(this));
        mainMenuButton.addEventListener('click', this.returnToMainMenu.bind(this));
    },

    handleKeyPress: function(event) {
        if (event.key === 'Escape' && gameCore.gameSettings.isGameActive) { // Используем gameCore
            this.menuVisible ? this.hideMenu() : this.showMenu();
        }
    },

    showMenu: function() {
        document.getElementById('gameMenu').style.display = 'flex';
        this.menuVisible = true;
        console.log('Game menu shown');
    },

    hideMenu: function() {
        document.getElementById('gameMenu').style.display = 'none';
        this.menuVisible = false;
        console.log('Game menu hidden');
    },

    returnToMainMenu: function() {
        console.log('Returning to main menu...');
        this.hideMenu();
        
        document.getElementById('mapContainer').style.display = 'none';
        document.getElementById('bottomInterface').style.display = 'none';
        document.getElementById('topInterface').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
        
        if (typeof bottomInterfaceModule !== 'undefined') {
            bottomInterfaceModule.hideInterface(); // Скрыть нижний интерфейс
        }
        
        gameCore.updateGameSettings({ isGameActive: false }); // Завершаем игру
        
        socket.emit('leaveRoom', { roomName: gameCore.lobby.roomName });
        gameCore.updateLobby({
            roomName: '',
            playerName: '',
            players: []
        });
    }
};

window.gameMenuModule = gameMenuModule;

window.addEventListener('load', () => {
    gameMenuModule.init();
});
