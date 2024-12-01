const playerBuildings = require('./playerBuildings');
const enemyManager = require('./enemyManager');

function attackNearbyEnemies(io, roomName, roomEnemies, roomOverlays) {
    const towers = playerBuildings.getBuildings(roomName).filter(b => b.name === 'T');
    towers.forEach(tower => {
        const { x, y, attackRadius, attackDamage } = tower;

        roomEnemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.position.x - x, 2) +
                Math.pow(enemy.position.y - y, 2)
            );

            if (distance <= attackRadius) {
                enemy.health -= attackDamage;
                if (enemy.health <= 0) {
                    const index = roomEnemies.indexOf(enemy);
                    if (index > -1) {
                        roomEnemies.splice(index, 1);
                    }
                    console.log("Enemy defeated")
                    io.to(roomName).emit('enemyDefeated', enemy.id);
                } else {
                    io.to(roomName).emit('enemyDamaged', { id: enemy.id, health: enemy.health });
                }
            }
        });
    });
}

module.exports = { attackNearbyEnemies };
