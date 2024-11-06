import overlayMapModule from './playingMap/overlayMap.js';

const movementModule = {
    targetPosition: null,

    setTargetPosition: function(x, y) {
        this.targetPosition = { x, y };
        this.movePlayer();
    },

    movePlayer: function() {
        if (!this.targetPosition) return;

        const { x: targetX, y: targetY } = this.targetPosition;
        const { x: currentX, y: currentY } = playerPositionModule.playerPosition;

        if (currentX === targetX && currentY === targetY) {
            this.targetPosition = null;
            return;
        }

        const nextX = currentX + Math.sign(targetX - currentX);
        const nextY = currentY + Math.sign(targetY - currentY);

        // Проверка на наличие здания
        if (overlayMapModule.isPositionBlocked(nextX, nextY)) {
            console.log('Movement blocked by building');
            this.targetPosition = null;
            return;
        }

        // Перемещение игрока
        playerPositionModule.playerPosition = { x: nextX, y: nextY };
        playerPositionModule.updatePlayerPosition();
        setTimeout(() => this.movePlayer(), 100);
    }
};

export default movementModule;
