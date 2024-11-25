const buildingModule = {
    buildings: {
        W: {  // Заменяем "wall" на "W"
            name: 'W',
            size: { width: 2, height: 2 },
            maxHealth: 100, // Максимальное здоровье
            health: 100,    // Текущее здоровье
            armor: 10,
            cost: { wood: 100, gold: 0 }
        },
        M: {  // Заменяем "mainBuilding" на "M"
            name: 'M',
            size: { width: 5, height: 5 },
            maxHealth: 500, 
            health: 500,    
            armor: 50,
            cost: { wood: 300, gold: 200 }
        },
        B: {  // Заменяем "barracks" на "B"
            name: 'B',
            size: { width: 4, height: 4 },
            maxHealth: 300, 
            health: 300,    
            armor: 25,
            cost: { wood: 150, gold: 50 }
        },
        F: {  // Заменяем "farm" на "F"
            name: 'F',
            size: { width: 4, height: 4 },
            maxHealth: 150, 
            health: 150,    
            armor: 5,
            cost: { wood: 50, gold: 0 }
        }
    },

    getAvailableBuildings: function() {
        return this.buildings;
    },

    getBuildingCost: function(buildingType) {
        return this.buildings[buildingType]?.cost || { wood: 0, gold: 0 };
    }
};

module.exports = buildingModule;
