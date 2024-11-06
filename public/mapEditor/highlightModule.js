const highlightModule = {
    currentHighlightedCells: [],

    init: function(mapEditorContainer) {
        mapEditorContainer.addEventListener('mousemove', this.handleMouseOver.bind(this));
        mapEditorContainer.addEventListener('mouseleave', this.clearHighlight.bind(this));
    },

    handleMouseOver: function(event) {
        const cell = event.target.closest('.editor-cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);

        // Сбрасываем старую подсветку
        this.clearHighlight();

        // Подсвечиваем новую область 2x2 клеток
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                const targetCell = document.querySelector(`.editor-cell[data-x="${nx}"][data-y="${ny}"]`);
                if (targetCell) {
                    targetCell.classList.add('highlight');
                    this.currentHighlightedCells.push(targetCell);
                }
            }
        }
    },

    clearHighlight: function() {
        this.currentHighlightedCells.forEach(cell => cell.classList.remove('highlight'));
        this.currentHighlightedCells = [];
    }
};

export default highlightModule;
