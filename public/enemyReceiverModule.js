// enemyReceiverModule.js

const enemyReceiverModule = {
    init: function(socket) {
        socket.on('newEnemy', (enemyData) => {
            gameCore.updateEnemies([enemyData]); // Добавляем нового врага в gameCore
        });

        socket.on('updateEnemy', (enemyUpdate) => {
            const enemy = gameCore.enemies[enemyUpdate.id];
            if (enemy) {
                enemy.position = enemyUpdate.position; // Обновляем позицию врага в gameCore
            }
        });
    }
};

export default enemyReceiverModule;
