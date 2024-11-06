const buildingModule = require('./buildingModule');
const playerResourcesServer = require('./playerResourcesServer');

const buildingManager = {
    checkResourcesForBuilding: function(socket, buildingName) {
        console.log("Проверка ресурса для:", buildingName);
        const buildings = buildingModule.getAvailableBuildings();

        // Поиск здания по внутреннему имени (например, 'W' для стены)
        const building = Object.values(buildings).find(b => b.name === buildingName);

        if (!building) return { success: false, message: "Unknown building." };

        const cost = building.cost;
        const playerResources = playerResourcesServer.getResources(socket.id);

        if (playerResources.wood >= cost.wood && playerResources.gold >= cost.gold) {
            console.log("Успешно:", buildingName);
            return { success: true, building: building, size: building.size };
        } else {
            return { success: false, message: "Not enough resources." };
        }
    },

    confirmBuild: function(socket, buildingName) {
        const buildings = buildingModule.getAvailableBuildings();

        // Поиск здания по `name`
        const buildingDetails = Object.values(buildings).find(b => b.name === buildingName);

        if (!buildingDetails) return { success: false, message: "Building not found." };

        const cost = buildingDetails.cost;
        const playerResources = playerResourcesServer.getResources(socket.id);

        if (playerResources.wood >= cost.wood && playerResources.gold >= cost.gold) {
            playerResourcesServer.updateResources(socket, {
                wood: playerResources.wood - cost.wood,
                gold: playerResources.gold - cost.gold,
            });
            console.log("Build")
            return { success: true };
        } else {
            return { success: false, message: "Resources depleted during placement." };
        }
    },
    handleBuilding: function(socket, io) {
        socket.on('requestBuildingOptions', () => {
            const buildingOptions = buildingModule.getAvailableBuildings();
            socket.emit('buildingOptions', buildingOptions);
        });

        socket.on('requestBuild', ({ buildingName }) => {
            const result = this.checkResourcesForBuilding(socket, buildingName);
            if (result.success) {
                socket.emit('buildCheckSuccess', { building: result.building, size: result.size });
            } else {
                socket.emit('buildCheckFailure', { message: result.message });
            }
        });

        socket.on('confirmBuild', ({ buildingName, x, y }) => {
            const result = this.confirmBuild(socket, buildingName);
            if (result.success) {
                const buildings = buildingModule.getAvailableBuildings();
                const buildingDetails = Object.values(buildings).find(b => b.name === buildingName);

                if (buildingDetails) {
                    socket.emit('buildConfirmSuccess', { message: "Building placed successfully." });
                    io.to(socket.id).emit('placeBuilding', { building: buildingDetails, x, y });
                }
            } else {
                socket.emit('buildConfirmFailure', { message: result.message });
            }
        });
    }

};

module.exports = buildingManager;
