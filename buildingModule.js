const buildingModule = {
    buildings: {
        wall: {
            name: 'W',
            size: { width: 2, height: 2 },
            health: 100,
            armor: 10,
            cost: { wood: 100, gold: 0 }
        },
        mainBuilding: {
            name: 'M',
            size: { width: 5, height: 5 },
            health: 500,
            armor: 50,
            cost: { wood: 300, gold: 200 }
        },
        barracks: {
            name: 'B',
            size: { width: 4, height: 4 },
            health: 300,
            armor: 25,
            cost: { wood: 150, gold: 50 }
        },
        farm: {
            name: 'F',
            size: { width: 4, height: 4 },
            health: 150,
            armor: 5,
            cost: { wood: 50, gold: 0 }
        }
    },

    getAvailableBuildings: function() {
        // Возвращаем объект с данными о доступных строениях
        return this.buildings;
    },

    getBuildingCost: function(buildingType) {
        // Получение стоимости для указанного типа здания
        return this.buildings[buildingType]?.cost || { wood: 0, gold: 0 };
    }
};

module.exports = buildingModule;
