const playerBuildings = {};
const buildingSubscriptions = {}; 

module.exports = {
    addBuilding(roomName, building, roomOverlays, io, socket)  {
        if (!playerBuildings[roomName]) {
            playerBuildings[roomName] = [];
        }
        playerBuildings[roomName].push(building);

        // Добавляем в roomOverlays
        if (!roomOverlays[roomName]) {
            roomOverlays[roomName] = [];
        }
        roomOverlays[roomName].push(building);

        // Синхронизация с клиентами
        io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        if (socket) {
            socket.emit('buildingDataResponse', building);
            this.subscribeToBuilding(socket, building.buildingId);
        }
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

            io.to(roomName).emit('buildingUpdated', building);

            const subscribers = buildingSubscriptions[buildingId];
            if (subscribers) {
                subscribers.forEach((socket) => {
                    socket.emit('buildingDataUpdated', building);
                });
            }
        }
    },
    subscribeToBuilding(socket, buildingId) {
        if (!buildingSubscriptions[buildingId]) {
            buildingSubscriptions[buildingId] = new Set();
        }
        if (!buildingSubscriptions[buildingId].has(socket)) {
            buildingSubscriptions[buildingId].add(socket);
            console.log(`Socket ${socket.id} подписался на здание ${buildingId}`);
        } else {
            console.log(`Socket ${socket.id} уже подписан на здание ${buildingId}`);
        }
    },
    unsubscribeFromBuilding(socket, buildingId) {
        if (buildingSubscriptions[buildingId]) {
            buildingSubscriptions[buildingId].delete(socket);
            console.log(`Socket ${socket.id} отписался от здания ${buildingId}`);
        }
    },

    

    attackBuilding(roomName, buildingId, damage, roomOverlays, io) {
        const building = this.getBuildingById(roomName, buildingId);
        if (building) {
            building.health -= damage;
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

    handleSocketEvents(socket, io) {
        socket.on('requestBuildingData', ({ roomName, buildingId }) => {
            const buildingData = this.getBuildingById(roomName, buildingId);
            if (buildingData) {
                socket.emit('buildingDataResponse', buildingData);
                this.subscribeToBuilding(socket, buildingId); // Подписка на обновления
            } else {
                console.error(`Building with ID ${buildingId} not found for room ${roomName}.`);
                socket.emit('buildingDataResponse', null);
            }
        });

        socket.on('unsubscribeBuilding', ({ buildingId }) => {
            this.unsubscribeFromBuilding(socket, buildingId);
        });

        socket.on('disconnect', () => {
            // Удаляем подписчика из всех подписок
            for (const buildingId in buildingSubscriptions) {
                this.unsubscribeFromBuilding(socket, buildingId);
            }
        });
    },

    getBuildingById(roomName, buildingId) {
        if (!playerBuildings[roomName]) return null;
        return playerBuildings[roomName].find(b => b.buildingId === buildingId) || null;
    },
};
