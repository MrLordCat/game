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
        socket.on('enemyDamaged', (enemyUpdate) => {
            const enemy = gameCore.enemies[enemyUpdate.id];
            if (enemy) {
                enemy.health = enemyUpdate.health;
                console.log(`Enemy ${enemyUpdate.id} health updated: ${enemyUpdate.health}`);
            }
        });

        // Новый обработчик: удаление врага
        socket.on('enemyDefeated', (enemyId) => {
            if (gameCore.enemies[enemyId]) {
                delete gameCore.enemies[enemyId];
                console.log(`Enemy ${enemyId} removed`);
            }
        });
    }
};

export default enemyReceiverModule;
