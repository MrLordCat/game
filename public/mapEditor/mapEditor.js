import mapManager from './mapManager.js';
import mapTools from './mapTools.js';
import mapStorage from './mapStorage.js';
import highlightModule from './highlightModule.js';

const mapEditorModule = {
    mapWidth: 100,
    mapHeight: 100,
    currentBrush: 'wall',
    needsRender: false,

    init: function() {
        console.log('Map editor initialized');
        document.getElementById('mapEditorInterface').style.display = 'block';
        document.getElementById('mapContainer').style.display = 'block';

        mapManager.mapWidth = this.mapWidth;
        mapManager.mapHeight = this.mapHeight;
        mapManager.createEmptyMap();
        this.renderMapEditor();
        this.startRenderLoop();
        this.addEventListeners();
        const mapEditorContainer = document.getElementById('mapContainer');
        highlightModule.init(mapEditorContainer);
    },

    renderMapEditor: function() {
        const mapEditorContainer = document.getElementById('mapContainer');
        mapEditorContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();
        for (let y = 0; y < mapManager.mapHeight; y++) {
            const row = document.createElement('div');
            row.className = 'map-row';
            for (let x = 0; x < mapManager.mapWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell editor-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                if (mapManager.mapData[y][x] === 1) cell.classList.add('wall');
                else if (mapManager.mapData[y][x] === 2) cell.classList.add('tree');

                row.appendChild(cell);
            }
            fragment.appendChild(row);
        }
        mapEditorContainer.appendChild(fragment);
    },

    updateCell: function(x, y) {
        const cell = document.querySelector(`.editor-cell[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            cell.className = 'map-cell editor-cell';
            if (mapManager.mapData[y][x] === 1) cell.classList.add('wall');
            else if (mapManager.mapData[y][x] === 2) cell.classList.add('tree');
        }
    },

    addEventListeners: function() {
        const mapEditorContainer = document.getElementById('mapContainer');

        // Отключаем стандартное контекстное меню
        mapEditorContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        mapEditorContainer.addEventListener('mousedown', (event) => {
            const cell = event.target;
            if (cell.classList.contains('editor-cell')) {
                const x = parseInt(cell.dataset.x, 10);
                const y = parseInt(cell.dataset.y, 10);

                if (event.button === 0) {
                    // Левый клик - добавить стену или дерево
                    this.applyBrush(x, y);
                } else if (event.button === 2) {
                    // Правый клик - удалить стену или дерево
                    this.removeBrush(x, y);
                }
            }
        });

        document.getElementById('editorWallBrush').addEventListener('click', () => {
            this.currentBrush = 'wall';
            console.log('Current brush set to: wall');
        });
        document.getElementById('editorTreeBrush').addEventListener('click', () => {
            this.currentBrush = 'tree';
            console.log('Current brush set to: tree');
        });
        document.getElementById('editorApplySize').addEventListener('click', () => {
            const newWidth = parseInt(document.getElementById('editorMapWidth').value);
            const newHeight = parseInt(document.getElementById('editorMapHeight').value);
            if (newWidth > 0 && newHeight > 0) {
                mapManager.mapWidth = newWidth;
                mapManager.mapHeight = newHeight;
                mapManager.createEmptyMap();
                this.needsRender = true;
            }
        });
        document.getElementById('editorSaveMap').addEventListener('click', () => mapStorage.saveMapToFile());
        document.getElementById('editorReturnToMenu').addEventListener('click', () => this.closeEditor());
        
    },

    applyBrush: function(x, y) {
        const brushType = this.currentBrush === 'wall' ? 1 : 2;
        console.log(`Applying brush type ${brushType} at (${x}, ${y})`);
        
        mapManager.applyBrush(x, y, brushType);
    
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                this.updateCell(x + dx, y + dy);
            }
        }
    },

    removeBrush: function(x, y) {
        console.log(`Removing element at (${x}, ${y})`);
        
        mapManager.applyBrush(x, y, 0);  // Устанавливаем область как пустую (0)
    
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                this.updateCell(x + dx, y + dy);
            }
        }
    },

    startRenderLoop: function() {
        const renderLoop = () => {
            if (this.needsRender) {
                this.needsRender = false;
                this.renderMapEditor();
            }
            requestAnimationFrame(renderLoop);
        };
        requestAnimationFrame(renderLoop);
    },
    closeEditor: function() {
        document.getElementById('mapEditorInterface').style.display = 'none';
        document.getElementById('mapContainer').innerHTML = ''; // Очищаем карту
    }
};

window.mapEditorModule = mapEditorModule;
export default mapEditorModule;
