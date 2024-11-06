const mapTools = {
    currentBrush: 'wall',

    init: function() {
        document.getElementById('wallBrush').addEventListener('click', () => this.currentBrush = 'wall');
        document.getElementById('treeBrush').addEventListener('click', () => this.currentBrush = 'tree');
        document.getElementById('applySize').addEventListener('click', this.updateMapSize.bind(this));
    },

    updateMapSize: function() {
        const newWidth = parseInt(document.getElementById('mapWidth').value);
        const newHeight = parseInt(document.getElementById('mapHeight').value);
        if (newWidth > 0 && newHeight > 0) {
            mapManager.mapWidth = newWidth;
            mapManager.mapHeight = newHeight;
            mapManager.createEmptyMap();
            mapRenderer.renderMap();
        }
    },

    getBrushType: function() {
        // Преобразуем текстовый тип в числовое представление
        return this.currentBrush === 'wall' ? 1 : 2;
    }
};

export default mapTools;
