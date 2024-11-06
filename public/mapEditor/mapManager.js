const mapManager = {
    mapData: [],
    mapWidth: 100,
    mapHeight: 100,

    init: function() {
        this.createEmptyMap();
    },

    createEmptyMap: function() {
        this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));

        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y][0] = 1;
            this.mapData[y][this.mapWidth - 1] = 1;
        }
        for (let x = 0; x < this.mapWidth; x++) {
            this.mapData[0][x] = 1;
            this.mapData[this.mapHeight - 1][x] = 1;
        }
    },

    applyBrush: function(x, y, brushType) {
        // Область 2x2 пикселей для каждого элемента
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < this.mapWidth && ny < this.mapHeight) {
                    this.mapData[ny][nx] = brushType;
                }
            }
        }
    }
};

export default mapManager;
