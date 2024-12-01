const playerBuildings = {};
const buildingSubscriptions = {}; 
const buildingModule = require('./buildingModule');
const playerResourcesServer = require('./playerResourcesServer');
module.exports = {
    startRepair: function(socket, io, buildingId, roomName, playersByRoom, overlayMapDataByRoom) {
        const player = playersByRoom[roomName][socket.id];
        const roomOverlays = overlayMapDataByRoom[roomName];
        const building = this.getBuildingById(roomName, buildingId);
    
        if (!building) {
            socket.emit('repairFailed', { message: "Building not found" });
            return;
        }
    
        const repairInterval = setInterval(() => {
            if (player.mana <= 0 || building.health >= building.maxHealth) {
                clearInterval(repairInterval);
                socket.emit('repairComplete', { buildingId });
                return;
            }
    
            const repairAmount = 10; // Фиксированная скорость починки
            const repaired = this.repairBuilding(roomName, io, buildingId, repairAmount, overlayMapDataByRoom, player);
    
            if (!repaired) {
                clearInterval(repairInterval);
                socket.emit('repairFailed', { message: "Repair failed" });
            } else {
                socket.emit('repairProgress', { buildingId, health: building.health, mana: player.mana });
            }
        }, 1000);
    },
    sellBuilding: function(socket, roomName, buildingId, roomOverlays, player, io) {
        const building = this.getBuildingById(roomName, buildingId);
        if (!building) {
            socket.emit('sellFailed', { message: "Building not found" });
            return;
        }
    
        // Возвращаем ресурсы игроку
        const buildingCost = buildingModule.getBuildingCost(building.name);
        if (!buildingCost) {
            console.error(`Building type ${building.name} not found in buildingModule.`);
            socket.emit('sellFailed', { message: "Invalid building type" });
            return;
        }
    
        const playerResources = playerResourcesServer.getResources(socket.id); // Получаем ресурсы игрока
        if (!playerResources) {
            console.error(`Resources not found for player with socket ID ${socket.id}`);
            socket.emit('sellFailed', { message: "Player resources not found" });
            return;
        }
    
        playerResources.wood += Math.floor(buildingCost.wood * 0.5); // Возврат 50% стоимости
        playerResources.gold += Math.floor(buildingCost.gold * 0.5);
    
        // Обновляем ресурсы игрока
        playerResourcesServer.updateResources(socket, playerResources);
    
        // Удаляем здание
        this.removeBuilding(roomName, buildingId, roomOverlays, io);
    
        // Уведомляем клиента
        socket.emit('sellSuccess', { buildingId, wood: buildingCost.wood * 0.5, gold: buildingCost.gold * 0.5 });
        console.log(`Building ${buildingId} sold by player ${socket.id}`);
    },
    
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
            console.log("DATA", building)
            socket.emit('buildingDataResponse', building);
            this.subscribeToBuilding(socket, building.buildingId);
        }
    },
    repairBuilding(roomName, io, buildingId, repairAmount, roomOverlays, player) {
        const building = this.getBuildingById(roomName, buildingId);
        if (building) {
            const maxHealth = building.maxHealth || 0;
            building.health = Math.min(building.health + repairAmount, maxHealth);
    
            // Уменьшение маны игрока
            player.mana -= Math.ceil(repairAmount / 10); // 1 мана за 10 здоровья
    
            this.updateBuilding(roomName, buildingId, { health: building.health }, roomOverlays, io);
            return true;
        }
        return false;
    },

    removeBuilding(roomName, buildingId, roomOverlays, io) {
        if (!playerBuildings[roomName]) return;
    
        const index = playerBuildings[roomName].findIndex(b => b.buildingId === buildingId);
        if (index !== -1) {
            const removed = playerBuildings[roomName].splice(index, 1);
    
            // Проверяем, что roomOverlays[roomName] — массив
            if (!Array.isArray(roomOverlays[roomName])) {
                console.error(`roomOverlays[${roomName}] is not an array. Converting to structured array.`);
    
                // Пытаемся восстановить данные в корректной структуре
                if (typeof roomOverlays[roomName] === 'object') {
                    roomOverlays[roomName] = [roomOverlays[roomName]]; // Заворачиваем объект в массив
                } else {
                    console.error(`Invalid roomOverlays[${roomName}] structure:`, roomOverlays[roomName]);
                    return; // Прерываем выполнение, если структура восстановить невозможно
                }
            }
    
            const overlayIndex = roomOverlays[roomName].findIndex(b => b.buildingId === buildingId);
            if (overlayIndex !== -1) {
                roomOverlays[roomName].splice(overlayIndex, 1);
            }
    
            io.to(roomName).emit('updateOverlayMap', roomOverlays[roomName]);
        }
    }
    ,
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
