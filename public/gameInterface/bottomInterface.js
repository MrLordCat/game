// bottomInterface.js

import buildMenuModule from './buildMenu.js';

const bottomInterfaceModule = {
    playerData: {
        xpPercentage: 100,
        health: 100,
        mana: 50,
        strength: 10,
        agility: 10,
        intelligence: 10
    },

    init: function() {
        console.log('Bottom interface initialized');
        this.hideInterface();
    },

    showInterface: function() {
        document.getElementById('bottomInterface').style.display = 'flex';
    },

    hideInterface: function() {
        document.getElementById('bottomInterface').style.display = 'none';
    },

    updatePlayerInfo: function(playerData) {
        this.playerData = { ...playerData };
        this.updateXP(this.playerData.xpPercentage);
        this.updateHealth(this.playerData.health);
        this.updateMana(this.playerData.mana);
        this.updateAttributes(this.playerData.strength, this.playerData.agility, this.playerData.intelligence);
    },

    updateBuildingInfo: function(building) {
        this.resetInterface();
        document.getElementById('bottomInterface_xpBar').style.display = 'none';
        document.getElementById('bottomInterface_health').textContent = `Health: ${building.health || 'N/A'}`;
        document.getElementById('bottomInterface_strength').textContent = `Armor: ${building.armor || 'N/A'}`;
        document.getElementById('bottomInterface_agility').textContent = '';
        document.getElementById('bottomInterface_intelligence').textContent = '';
        document.getElementById('bottomInterface_mana').textContent = '';

        const buttonGrid = document.getElementById('bottomInterface_buttonGrid');
        buttonGrid.innerHTML = '';

        if (building.hasMenu) {
            const upgradeButton = document.createElement('button');
            upgradeButton.textContent = 'Upgrade';
            const repairButton = document.createElement('button');
            repairButton.textContent = 'Repair';

            buttonGrid.appendChild(upgradeButton);
            buttonGrid.appendChild(repairButton);
        } else {
            for (let i = 0; i < 9; i++) {
                const emptyButton = document.createElement('button');
                emptyButton.textContent = '';
                buttonGrid.appendChild(emptyButton);
            }
        }
    },

    resetInterface: function() {
        document.getElementById('bottomInterface_xpBar').style.display = 'block';
        this.updateXP(this.playerData.xpPercentage);
        this.updateHealth(this.playerData.health);
        this.updateMana(this.playerData.mana);
        this.updateAttributes(this.playerData.strength, this.playerData.agility, this.playerData.intelligence);

        const buttonGrid = document.getElementById('bottomInterface_buttonGrid');
        buttonGrid.innerHTML = `
            <button id="bottomInterface_buildButton">B</button>
            <button id="bottomInterface_repairButton">R</button>
            <button id="bottomInterface_skillButton">S</button>
            <button></button>
            <button></button>
            <button></button>
            <button></button>
            <button></button>
            <button></button>
        `;
        buildMenuModule.isOpen = false;
        const buildButton = document.getElementById("bottomInterface_buildButton");
        buildButton.onclick = () => {
            buildMenuModule.toggleBuildMenu();
        };
    },

    updateXP: function(xpPercentage) {
        const xpBar = document.getElementById('bottomInterface_xpBar');
        xpBar.style.width = `${xpPercentage}%`;
    },

    updateHealth: function(health) {
        document.getElementById('bottomInterface_health').textContent = `Health: ${health}`;
    },

    updateMana: function(mana) {
        document.getElementById('bottomInterface_mana').textContent = `Mana: ${mana}`;
    },

    updateAttributes: function(strength, agility, intelligence) {
        document.getElementById('bottomInterface_strength').textContent = `Strength: ${strength}`;
        document.getElementById('bottomInterface_agility').textContent = `Agility: ${agility}`;
        document.getElementById('bottomInterface_intelligence').textContent = `Intelligence: ${intelligence}`;
    }
};

window.bottomInterfaceModule = bottomInterfaceModule;

window.addEventListener('load', () => {
    bottomInterfaceModule.init();
});

export default bottomInterfaceModule;
