// gameMenu.js

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

        resumeButton.addEventListener('click', this.hideMenu.bind(this));
        mainMenuButton.addEventListener('click', this.returnToMainMenu.bind(this));
    },

    handleKeyPress: function(event) {
        if (event.key === 'Escape' && gameCore.gameSettings.isGameActive) {
            // Проверяем на наличие активного призрака здания
            if (mapModule.buildingManager.ghostBuilding) {
                mapModule.buildingManager.cancelGhostPlacement(); // Отменяем призрак
                console.log("Canceled ghost building placement due to ESC key");
            } else if (buildingSelectionModule.selectedBuilding) { // Проверка на выбранное здание
                buildingSelectionModule.deselectBuilding();
                console.log("Deselected building interface due to ESC key");
            } else {
                this.menuVisible ? this.hideMenu() : this.showMenu(); // Открываем или закрываем меню игры
            }
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

window.gameMenuModule = gameMenuModule;

window.addEventListener('load', () => {
    gameMenuModule.init();
});
