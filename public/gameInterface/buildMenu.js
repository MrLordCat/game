const buildMenuModule = {
    isOpen: false,

    openBuildMenu: function() {
        this.isOpen = true;

        // Запрашиваем данные у сервера и обновляем gameCore
        socket.emit('requestBuildingOptions');
        socket.on('buildingOptions', (data) => {
            gameCore.updatePlayerBuildings(data); // Сохраняем данные в gameCore
            this.renderBuildingMenu();
        });
    },

    renderBuildingMenu: function() {
        const buttonGrid = document.getElementById("bottomInterface_buttonGrid");
        buttonGrid.innerHTML = '';

        let index = 0;
        for (const key in gameCore.playerBuildings) { // Используем здания из gameCore
            if (index < 8) {
                const building = gameCore.playerBuildings[key];
                const buildButton = document.createElement("button");
                buildButton.textContent = building.name.charAt(0);
                buildButton.onclick = () => {
                    console.log(building.name);
                    buildingCheck.requestBuild(building.name);
                };
                buttonGrid.appendChild(buildButton);
                index++;
            }
        }

        while (index < 8) {
            const emptyButton = document.createElement("button");
            buttonGrid.appendChild(emptyButton);
            index++;
        }

        const backButton = document.createElement("button");
        backButton.textContent = 'B';
        backButton.onclick = () => {
            this.closeBuildMenu();
        };
        buttonGrid.appendChild(backButton);
    },

    closeBuildMenu: function() {
        this.isOpen = false;
        const buttonGrid = document.getElementById("bottomInterface_buttonGrid");
        buttonGrid.innerHTML = '';

        const originalTexts = ['B', 'R', 'S', '', '', '', '', '', ''];
        originalTexts.forEach((text, index) => {
            const originalButton = document.createElement("button");
            originalButton.textContent = text;
            buttonGrid.appendChild(originalButton);

            if (text === 'B') {
                originalButton.id = "bottomInterface_buildButton";
                originalButton.onclick = () => {
                    this.toggleBuildMenu();
                };
            }
        });
    },

    toggleBuildMenu: function() {
        if (this.isOpen) {
            this.closeBuildMenu();
        } else {
            this.openBuildMenu();
        }
    }
};

document.getElementById("bottomInterface_buildButton").addEventListener("click", () => {
    buildMenuModule.toggleBuildMenu();
});
