// gameCore.js

window.gameCore = {
    lobby: {
        roomName: '',
        playerName: '',
        players: [],
        selectedMap: null,
    },
    playerAttributes: {
        health: 0,
        mana: 0,
        strength: 0,
        agility: 0,
        intelligence: 0,
    },
    playerBuildings: {}, 
    enemies: {},
    gameSettings: {
        isGameActive: false,
        timer: 0, 
        resources: {
            gold: 0,
            wood: 0,
            food: {
                current: 0,
                max: 0,
            }
        }
    },
    
    // Методы для обновления данных
    updateLobby(data) {
        this.lobby = { ...this.lobby, ...data };
    },

    updatePlayerAttributes(attributes) {
        this.playerAttributes = { ...this.playerAttributes, ...attributes };
    },
    updateEnemies(enemyData) {
        enemyData.forEach((enemy) => {
            this.enemies[enemy.id] = enemy;
        });
        console.log("Updated enemies:", this.enemies);
    },
    updateGameSettings(settings) {
        this.gameSettings = { ...this.gameSettings, ...settings };
    },
    updatePlayerBuildings(buildings) {
        this.playerBuildings = { ...buildings };
        console.log("Updated player buildings:", this.playerBuildings);
    },
    updateTimer(seconds) {
        this.gameSettings.timer = seconds;
        if (typeof topInterfaceModule !== 'undefined') {
            topInterfaceModule.updateTimer(this.formatTime(seconds));
        }
    },

    updateResources(resources) {
        this.gameSettings.resources = { ...this.gameSettings.resources, ...resources };
        if (typeof topInterfaceModule !== 'undefined') {
            topInterfaceModule.updateResourcesUI(this.gameSettings.resources);
        }
    },

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const sec = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${sec}`;
    }
};
