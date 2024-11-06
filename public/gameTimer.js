// gameTimer.js

const gameTimerModule = {
    start: function() {
        console.log('Starting game timer...');

        // Используем gameCore для обновления таймера
        window.socket.on('updateTimer', (time) => {
            gameCore.updateTimer(time);
        });
    },

    reset: function() {
        gameCore.updateTimer(0);  // Сбрасываем таймер в gameCore
    }
};

// Начинаем и сбрасываем таймер в зависимости от состояния игры
window.socket.on('gameStarted', () => {
    gameTimerModule.start();
});

window.socket.on('gameEnded', () => {
    gameTimerModule.reset();
});
