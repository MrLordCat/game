// enemyRendererModule.js

const cellSize = 10;

const enemyRendererModule = {
    enemyElements: {},

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
            enemyElement.style.position = 'absolute';

            // Преобразуем координаты врага для отображения внутри карты
            enemyElement.style.left = `${enemy.position.x * cellSize}px`;
            enemyElement.style.top = `${enemy.position.y * cellSize}px`;
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
    }
};

export default enemyRendererModule;
