// topInterface.js

const topInterfaceModule = {
    init: function () {
        this.updateTimer('00:00');
        this.updateResourcesUI({
            gold: 0,
            wood: 0,
            food: { current: 0, max: 0 }
        });
    },

    showInterface: function () {
        document.getElementById('topInterface').style.display = 'flex';
    },

    hideInterface: function () {
        document.getElementById('topInterface').style.display = 'none';
    },

    updateTimer: function (time) {
        document.getElementById('gameTimer').textContent = time;
    },

    updateResourcesUI: function (resources) {
        this.updateGold(resources.gold);
        this.updateWood(resources.wood);
        this.updateFood(resources.food.current, resources.food.max);
    },

    updateGold: function (gold) {
        document.getElementById('goldCounter').textContent = `Gold: ${gold}`;
    },

    updateWood: function (wood) {
        document.getElementById('woodCounter').textContent = `Wood: ${wood}`;
    },

    updateFood: function (currentFood, maxFood) {
        document.getElementById('foodCounter').textContent = `Food: ${currentFood}/${maxFood}`;
    }
};

// Инициализация интерфейса и обновление при запуске и завершении игры
topInterfaceModule.init();

window.socket.on('gameStarted', () => {
    topInterfaceModule.showInterface();
});

window.socket.on('gameEnded', () => {
    topInterfaceModule.hideInterface();
});
