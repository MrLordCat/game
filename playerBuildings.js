const playerBuildings = {};

module.exports = {
    addBuilding(roomName, building, io) {
        if (!playerBuildings[roomName]) {
            playerBuildings[roomName] = [];
        }
        playerBuildings[roomName].push(building);
        console.log(`Building added:`, building);
        io.to(roomName).emit('buildingAdded', building); // Уведомляем клиентов
    },

    getBuildings(roomName) {
        return playerBuildings[roomName] || [];
    },

    updateBuilding(roomName, buildingId, updates, io) {
        if (!playerBuildings[roomName]) return;

        const building = playerBuildings[roomName].find(b => b.buildingId === buildingId);
        if (building) {
            Object.assign(building, updates);
            console.log(`Building updated:`, building);
            io.to(roomName).emit('buildingUpdated', building); // Уведомляем клиентов
        }
    },

    removeBuilding(roomName, buildingId, io) {
        if (!playerBuildings[roomName]) return;

        const index = playerBuildings[roomName].findIndex(b => b.buildingId === buildingId);
        if (index !== -1) {
            const removed = playerBuildings[roomName].splice(index, 1);
            console.log(`Building removed:`, removed);
            io.to(roomName).emit('buildingRemoved', removed[0]); // Уведомляем клиентов
        }
    },

    attackBuilding(roomName, buildingId, damage, io) {
        const building = this.getBuildingById(roomName, buildingId);
        if (building) {
            building.health -= damage;
            console.log(`Building ${buildingId} attacked. Remaining health: ${building.health}`);
            if (building.health <= 0) {
                this.removeBuilding(roomName, buildingId, io);
                console.log(`Building ${buildingId} destroyed.`);
                return true; // Указывает, что здание уничтожено
            } else {
                this.updateBuilding(roomName, buildingId, { health: building.health }, io);
            }
        }
        return false; // Здание не уничтожено
    },

    getBuildingById(roomName, buildingId) {
        if (!playerBuildings[roomName]) return null;
        return playerBuildings[roomName].find(b => b.buildingId === buildingId) || null;
    },
};
