// playerBuildings.js

const buildingSubscriptions = {}; 
const buildingModule = require('./buildingModule');
const playerResourcesServer = require('./playerResourcesServer');
const playerData = require('./playerDataModule');

module.exports = {
    startRepair: function(socket, io, buildingId, roomName, playersByRoom, overlayMapDataByRoom) {
        const player = playersByRoom[roomName][socket.id];
        const building = playerData.getBuildingById(socket.id, buildingId);
    
        if (!building) {
            socket.emit('repairFailed', { message: "Building not found" });
            return;
        }
    
        const repairInterval = setInterval(() => {
            const attributes = playerData.getAttributes(socket.id);
            if (attributes.mana <= 0 || building.health >= building.maxHealth) {
                clearInterval(repairInterval);
                socket.emit('repairComplete', { buildingId });
                return;
            }
    
            const repairAmount = 10; 
            const repaired = this.repairBuilding(socket, io, buildingId, repairAmount, overlayMapDataByRoom);
    
            if (!repaired) {
                clearInterval(repairInterval);
                socket.emit('repairFailed', { message: "Repair failed" });
            } else {
                // Обновим данные о здании
                const updatedBuilding = playerData.getBuildingById(socket.id, buildingId);
                const updatedAttributes = playerData.getAttributes(socket.id);
                socket.emit('repairProgress', { buildingId, health: updatedBuilding.health, mana: updatedAttributes.mana });
            }
        }, 1000);
    },

    sellBuilding: function(socket, roomName, buildingId, roomOverlays, player, io) {
        const building = playerData.getBuildingById(socket.id, buildingId);
        if (!building) {
            socket.emit('sellFailed', { message: "Building not found" });
            return;
        }
    
        const buildingCost = buildingModule.getBuildingCost(building.name);
        if (!buildingCost) {
            console.error(`Building type ${building.name} not found in buildingModule.`);
            socket.emit('sellFailed', { message: "Invalid building type" });
            return;
        }

        const playerRes = playerData.getResources(socket.id);
        playerRes.wood += Math.floor(buildingCost.wood * 0.5);
        playerRes.gold += Math.floor(buildingCost.gold * 0.5);

        playerData.updateResources(socket.id, playerRes);
        
        this.removeBuilding(socket, io, buildingId, roomOverlays, roomName);
        socket.emit('sellSuccess', { buildingId, wood: buildingCost.wood * 0.5, gold: buildingCost.gold * 0.5 });
        console.log(`Building ${buildingId} sold by player ${socket.id}`);
    },
    
    addBuilding(socket, roomName, building, roomOverlays, io) {
        playerData.addBuilding(socket.id, building);

        // Добавляем в roomOverlays (обновление карты)
        if (!roomOverlays[roomName]) {
            roomOverlays[roomName] = [];
        }
        roomOverlays[roomName].push(building);
        io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        if (socket) {
            socket.emit('buildingDataResponse', building);
            this.subscribeToBuilding(socket, building.buildingId);
        }
    },

    repairBuilding(socket, io, buildingId, repairAmount, roomOverlays) {
        const building = playerData.getBuildingById(socket.id, buildingId);
        if (building) {
            const maxHealth = building.maxHealth || 0;
            building.health = Math.min(building.health + repairAmount, maxHealth);
            
            // Уменьшение маны
            const attributes = playerData.getAttributes(socket.id);
            attributes.mana -= Math.ceil(repairAmount / 10);
            playerData.updateAttributes(socket.id, attributes);

            playerData.updateBuilding(socket.id, buildingId, { health: building.health });

            io.emit('buildingUpdated', building);

            const subscribers = buildingSubscriptions[buildingId];
            if (subscribers) {
                subscribers.forEach((sck) => {
                    sck.emit('buildingDataUpdated', building);
                });
            }
            return true;
        }
        return false;
    },

    removeBuilding(socket, io, buildingId, roomOverlays, roomName) {
        const removed = playerData.removeBuilding(socket.id, buildingId);
        if (removed) {
            if (!Array.isArray(roomOverlays[roomName])) {
                console.error(`roomOverlays[${roomName}] is not an array. Fixing structure.`);
                if (typeof roomOverlays[roomName] === 'object') {
                    roomOverlays[roomName] = [roomOverlays[roomName]];
                } else {
                    console.error(`Invalid roomOverlays[${roomName}] structure:`, roomOverlays[roomName]);
                    return;
                }
            }
    
            const overlayIndex = roomOverlays[roomName].findIndex(b => b.buildingId === buildingId);
            if (overlayIndex !== -1) {
                roomOverlays[roomName].splice(overlayIndex, 1);
            }

            io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        }
    },

    getBuildings(socketId) {
        return playerData.getBuildings(socketId);
    },

    updateBuilding(socketId, buildingId, updates, io) {
        const building = playerData.updateBuilding(socketId, buildingId, updates);
        if (building) {
            io.emit('buildingUpdated', building);
            const subscribers = buildingSubscriptions[buildingId];
            if (subscribers) {
                subscribers.forEach((s) => {
                    s.emit('buildingDataUpdated', building);
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

    attackBuilding(socket, io, buildingId, damage, roomOverlays, roomName) {
        const building = playerData.getBuildingById(socket.id, buildingId);
        if (building) {
            building.health -= damage;
            if (building.health <= 0) {
                this.removeBuilding(socket, io, buildingId, roomOverlays, roomName);
                console.log(`Building ${buildingId} destroyed.`);
                return true;
            } else {
                playerData.updateBuilding(socket.id, buildingId, { health: building.health });
                io.emit('buildingUpdated', building);
            }
        }
        return false;
    },

    handleSocketEvents(socket, io) {
        socket.on('requestBuildingData', ({ roomName, buildingId }) => {
            const buildingData = playerData.getBuildingById(socket.id, buildingId);
            if (buildingData) {
                socket.emit('buildingDataResponse', buildingData);
                this.subscribeToBuilding(socket, buildingId);
            } else {
                console.error(`Building with ID ${buildingId} not found for player ${socket.id}.`);
                socket.emit('buildingDataResponse', null);
            }
        });

        socket.on('unsubscribeBuilding', ({ buildingId }) => {
            this.unsubscribeFromBuilding(socket, buildingId);
        });

        socket.on('disconnect', () => {
            for (const bId in buildingSubscriptions) {
                this.unsubscribeFromBuilding(socket, bId);
            }
        });
    },

    getBuildingById(socketId, buildingId) {
        return playerData.getBuildingById(socketId, buildingId);
    },
};
