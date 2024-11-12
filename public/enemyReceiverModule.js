const enemyReceiverModule = {
    init: function(socket) {
        socket.on('newEnemy', (enemyData) => {
            gameCore.updateEnemies([enemyData]); 
        });

        socket.on('updateEnemy', (enemyUpdate) => {
            const enemy = gameCore.enemies[enemyUpdate.id];
            if (enemy) {
                enemy.position = enemyUpdate.position; 
            }
        });

        // Обработка обновлений врагов, поступающих массивом
        socket.on('updateEnemies', (enemiesUpdate) => {
            enemiesUpdate.forEach(enemyUpdate => {
                const enemy = gameCore.enemies[enemyUpdate.id];
                if (enemy) {
                    enemy.position = enemyUpdate.position; 
                } else {
                 
                    gameCore.updateEnemies([enemyUpdate]);
                }
            });
        });
    }
};

export default enemyReceiverModule;
