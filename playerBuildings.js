const playerBuildings = {};

module.exports = {
    addBuilding(roomName, building, roomOverlays, io) {
        if (!playerBuildings[roomName]) {
            playerBuildings[roomName] = [];
        }
        playerBuildings[roomName].push(building);

        // Добавляем в roomOverlays
        if (!roomOverlays[roomName]) {
            roomOverlays[roomName] = [];
        }
        roomOverlays[roomName].push(building);

        console.log(`Building added:`, building);

        // Синхронизация с клиентами
        io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
    },

    removeBuilding(roomName, buildingId, roomOverlays, io) {
        if (!playerBuildings[roomName]) return;

        const index = playerBuildings[roomName].findIndex(b => b.buildingId === buildingId);
        if (index !== -1) {
            const removed = playerBuildings[roomName].splice(index, 1);

            // Удаляем из roomOverlays
            const overlayIndex = roomOverlays[roomName]?.findIndex(b => b.buildingId === buildingId);
            if (overlayIndex !== -1) {
                roomOverlays[roomName].splice(overlayIndex, 1);
            }

            console.log(`Building removed:`, removed);

            // Синхронизация с клиентами
            io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        }
    },
    getBuildings(roomName) {
        return playerBuildings[roomName] || [];
    },

    updateBuilding(roomName, buildingId, updates, roomOverlays, io) {
        if (!playerBuildings[roomName]) return;
    
        const building = playerBuildings[roomName].find(b => b.buildingId === buildingId);
        if (building) {
            Object.assign(building, updates);
    
            // Синхронизация с клиентами
            if (io && roomName) {
                io.to(roomName).emit('buildingUpdated', building);
            } else {
                console.error(`Invalid io or roomName in updateBuilding`);
            }
        }
    },
    

    attackBuilding(roomName, buildingId, damage, roomOverlays, io) {
        const building = this.getBuildingById(roomName, buildingId);
        if (building) {
            building.health -= damage;
            console.log(`Building ${buildingId} attacked. Remaining health: ${building.health}`);
            if (building.health <= 0) {
                this.removeBuilding(roomName, buildingId, roomOverlays, io);
                console.log(`Building ${buildingId} destroyed.`);
                return true;
            } else {
                this.updateBuilding(roomName, buildingId, { health: building.health }, roomOverlays, io);
            }
        }
        return false;
    },

    getBuildingById(roomName, buildingId) {
        if (!playerBuildings[roomName]) return null;
        return playerBuildings[roomName].find(b => b.buildingId === buildingId) || null;
    },

    handleSocketEvents(socket, io) {
        // Обработка запроса на получение всех зданий
        socket.on('requestBuildings', ({ roomName }) => {
            const buildings = this.getBuildings(roomName);
            socket.emit('buildingsResponse', buildings);
        });

        // Обработка запроса на данные конкретного здания
        socket.on('requestBuildingData', ({ roomName, buildingId }) => {
            const buildingData = this.getBuildingById(roomName, buildingId);
            if (buildingData) {
                socket.emit('buildingDataResponse', buildingData);
            } else {
                console.error(`Building with ID ${buildingId} not found for room ${roomName}.`);
                socket.emit('buildingDataResponse', null);
            }
        });
    }
};
