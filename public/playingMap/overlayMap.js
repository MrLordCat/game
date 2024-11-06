import buildingSelectionModule from '../gameInterface/buildingSelectionModule.js';


const overlayMapModule = {
    buildingsCoordinates: [],
    init: function() {
        // Создаем контейнер для наложения
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'overlayContainer';
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = 0;
        overlayContainer.style.left = 0;
        overlayContainer.style.width = '100%';
        overlayContainer.style.height = '100%';
        document.getElementById('mapContainer').appendChild(overlayContainer);
        
        console.log('Overlay map initialized');
    },

    placeBuilding: function(x, y, building) {
        const overlayContainer = document.getElementById('overlayContainer');
        if (!overlayContainer) {
            console.error('Overlay container not found. Make sure overlayMapModule.init() was called.');
            return;
        }
        console.log(building)
        const buildingElement = document.createElement('div');
        buildingElement.className = `building-overlay ${building.name}`;
        buildingElement.style.position = 'absolute';
        buildingElement.style.width = `${building.size.width * 10}px`;
        buildingElement.style.height = `${building.size.height * 10}px`;
        buildingElement.style.left = `${x * 10}px`;
        buildingElement.style.top = `${y * 10}px`;

        this.buildingsCoordinates.push({ x, y, width: building.size.width, height: building.size.height });
              // Добавляем обработчик для выбора здания
              buildingElement.addEventListener('mouseenter', () => {
                console.log('Mouse entered building');
                buildingSelectionModule.hoverBuilding(buildingElement);
            });
            
            buildingElement.addEventListener('mouseleave', () => {
                console.log('Mouse left building');
                buildingSelectionModule.unhoverBuilding();
            });
            
            buildingElement.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log('Building clicked:', building);
                buildingSelectionModule.selectBuilding(buildingElement, building.name); // Передаем только идентификатор (имя) здания
            });
        overlayContainer.appendChild(buildingElement);
    },
    isPositionBlocked: function(x, y) {
        return this.buildingsCoordinates.some(building => {
            return (
                x >= building.x &&
                x < building.x + building.width &&
                y >= building.y &&
                y < building.y + building.height
            );
        });
    },

    clearBuilding: function() {
        const overlayContainer = document.getElementById('overlayContainer');
        if (overlayContainer) {
            overlayContainer.innerHTML = ''; // Очистка всех построек, если требуется
        }
        this.buildingsCoordinates = [];
        buildingSelectionModule.deselectBuilding();
    }
};

export default overlayMapModule;
