// playerBuildings.js
const playerBuildings = {};

module.exports = {
    addBuilding(roomName, building) {
        if (!playerBuildings[roomName]) {
            playerBuildings[roomName] = [];
        }
        playerBuildings[roomName].push(building);
        console.log(`Building added:`, building);
    },

    getBuildings(roomName) {
        return playerBuildings[roomName] || [];
    },

    updateBuilding(roomName, buildingId, updates) {
        if (!playerBuildings[roomName]) return;

        const building = playerBuildings[roomName].find(b => b.buildingId === buildingId);
        if (building) {
            Object.assign(building, updates);
            console.log(`Building updated:`, building);
        }
    },

    removeBuilding(roomName, buildingId) {
        if (!playerBuildings[roomName]) return;

        const index = playerBuildings[roomName].findIndex(b => b.buildingId === buildingId);
        if (index !== -1) {
            const removed = playerBuildings[roomName].splice(index, 1);
            console.log(`Building removed:`, removed);
        }
    },

    getBuildingById(roomName, buildingId) {
        if (!playerBuildings[roomName]) return null;
        return playerBuildings[roomName].find(b => b.buildingId === buildingId) || null;
    },
};
function updateBuildingHealth(roomName, buildingId, damage) {
    const building = playerBuildings.getBuildingById(roomName, buildingId);
    if (building) {
        building.health -= damage;

        if (building.health <= 0) {
            console.log(`Building ${buildingId} destroyed.`);
            playerBuildings.removeBuilding(roomName, buildingId);
            const overlayIndex = roomOverlays[roomName].findIndex(b => b.buildingId === buildingId);
            if (overlayIndex !== -1) {
                roomOverlays[roomName].splice(overlayIndex, 1);
            }
            io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        } else {
            playerBuildings.updateBuilding(roomName, buildingId, { health: building.health });
            console.log(`Building ${buildingId} health updated to ${building.health}.`);
        }
    } else {
        console.error(`Building ${buildingId} not found in room ${roomName}.`);
    }
}