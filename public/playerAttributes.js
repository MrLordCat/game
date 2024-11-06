// playerAttributes.js

const playerAttributesModule = {
    initializeAttributes: function() {
        console.log('Initializing player attributes...');

        // Проверка наличия модулей интерфейса перед обновлением UI
        if (typeof bottomInterfaceModule !== 'undefined') {
            this.updateAttributesUI();
        } else {
            console.error('Modules for interface not found. Make sure bottomInterfaceModule is loaded.');
        }

        // Начинаем слушать событие playerAttributes только после запроса
        window.socket.on('playerAttributes', (attributes) => {
            playerAttributesModule.setAttributes(attributes);
        });

        // Запрос атрибутов с сервера с указанием комнаты
        window.socket.emit('requestPlayerAttributes', { roomName: gameCore.lobby.roomName });
    },

    setAttributes: function(attributes) {
        // Обновляем атрибуты в gameCore
        gameCore.updatePlayerAttributes({
            strength: attributes.strength,
            agility: attributes.agility,
            intelligence: attributes.intelligence,
            health: attributes.maxHealth, // Устанавливаем `health` как `maxHealth`
            mana: attributes.maxMana      // Устанавливаем `mana` как `maxMana`
        });
        this.updateAttributesUI();
    },

    updateAttributesUI: function() {
        if (typeof bottomInterfaceModule !== 'undefined') {
            const { health, mana, strength, agility, intelligence } = gameCore.playerAttributes;

            // Обновляем интерфейс с помощью updatePlayerInfo для согласованности данных
            bottomInterfaceModule.updatePlayerInfo({
                xpPercentage: 100, // Добавьте актуальный процент, если он известен
                health,
                mana,
                strength,
                agility,
                intelligence
            });
        }
    }
};
