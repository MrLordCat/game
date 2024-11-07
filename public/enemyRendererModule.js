const cellSize = 10;

const enemyRendererModule = {
    enemyElements: {},
    enemyPositions: {},

    renderEnemies: function() {
        const enemyContainer = document.getElementById('enemyContainer') || this.createEnemyContainer();
        
        Object.values(gameCore.enemies).forEach((enemy) => {
            let enemyElement = this.enemyElements[enemy.id];
            if (!enemyElement) {
                enemyElement = document.createElement('div');
                enemyElement.classList.add('enemy');
                this.enemyElements[enemy.id] = enemyElement;
                enemyContainer.appendChild(enemyElement);
            }

            const sizeInPixels = enemy.size.width * cellSize;
            enemyElement.style.width = `${sizeInPixels}px`;
            enemyElement.style.height = `${sizeInPixels}px`;

            // Целевые координаты врага
            const targetX = enemy.position.x * cellSize;
            const targetY = enemy.position.y * cellSize;

            // Начальные координаты для интерполяции
            if (!this.enemyPositions[enemy.id]) {
                this.enemyPositions[enemy.id] = { x: targetX, y: targetY };
            }

            const currentPos = this.enemyPositions[enemy.id];
            currentPos.x += (targetX - currentPos.x) * 0.1; // Коэффициент сглаживания 0.1
            currentPos.y += (targetY - currentPos.y) * 0.1;

            enemyElement.style.left = `${currentPos.x}px`;
            enemyElement.style.top = `${currentPos.y}px`;
        });
    },

    createEnemyContainer: function() {
        const mapContainer = document.getElementById('mapContainer');
        const enemyContainer = document.createElement('div');
        enemyContainer.id = 'enemyContainer';
        enemyContainer.style.position = 'absolute';
        enemyContainer.style.width = '100%';
        enemyContainer.style.height = '100%';
        enemyContainer.style.top = '0';
        enemyContainer.style.left = '0';
        mapContainer.appendChild(enemyContainer);
        return enemyContainer;
    },

    update: function() {
        this.renderEnemies();
        requestAnimationFrame(this.update.bind(this)); // Обновляем через requestAnimationFrame для плавности
    }
};

export default enemyRendererModule;
