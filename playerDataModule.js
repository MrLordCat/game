// playerDataModule.js
// Этот модуль будет хранить все данные игроков в одном месте.
// Ключи - по socket.id (или по какому-то другому уникальному идентификатору игрока)

const playersData = {}; 

function initializePlayerData(socketId) {
    // Инициализируем все данные игрока в одном месте
    playersData[socketId] = {
        resources: {
            gold: 1000,
            wood: 1000,
            food: { current: 0, max: 100 }
        },
        buildings: [],
        attributes: {
            health: 100,
            mana: 100,
            // любые другие атрибуты
        },
        upgrades: {
            // пример структуры апгрейдов
            // researchCenterLevel: 1,
            // buildingSpeedBoost: false,
        }
    };
    return playersData[socketId];
}

function getPlayerData(socketId) {
    if (!playersData[socketId]) {
        initializePlayerData(socketId);
    }
    return playersData[socketId];
}

// РЕСУРСЫ
function getResources(socketId) {
    return getPlayerData(socketId).resources;
}

function updateResources(socketId, newResources) {
    const player = getPlayerData(socketId);
    Object.assign(player.resources, newResources);
    return player.resources;
}

// ЗДАНИЯ
function getBuildings(socketId) {
    return getPlayerData(socketId).buildings;
}

function addBuilding(socketId, building) {
    const player = getPlayerData(socketId);
    player.buildings.push(building);
    return building;
}

function removeBuilding(socketId, buildingId) {
    const player = getPlayerData(socketId);
    const index = player.buildings.findIndex(b => b.buildingId === buildingId);
    if (index !== -1) {
        return player.buildings.splice(index, 1)[0];
    }
    return null;
}

function getBuildingById(socketId, buildingId) {
    return getPlayerData(socketId).buildings.find(b => b.buildingId === buildingId) || null;
}

function updateBuilding(socketId, buildingId, updates) {
    const building = getBuildingById(socketId, buildingId);
    if (building) {
        Object.assign(building, updates);
    }
    return building;
}

// АТРИБУТЫ
function getAttributes(socketId) {
    return getPlayerData(socketId).attributes;
}

function updateAttributes(socketId, attrUpdates) {
    const player = getPlayerData(socketId);
    Object.assign(player.attributes, attrUpdates);
    return player.attributes;
}

// Апгрейды или другие данные можно добавить аналогичным образом

function resetPlayerData(socketId) {
    initializePlayerData(socketId);
}

function deletePlayerData(socketId) {
    delete playersData[socketId];
}

module.exports = {
    initializePlayerData,
    getPlayerData,
    getResources,
    updateResources,
    getBuildings,
    addBuilding,
    removeBuilding,
    getBuildingById,
    updateBuilding,
    getAttributes,
    updateAttributes,
    resetPlayerData,
    deletePlayerData
};
