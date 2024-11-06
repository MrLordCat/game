// playerAttributes.js

// Функция для расчета параметров игрока на основе характеристик
function calculateAttributes({ strength, agility, intelligence }) {
    const maxHealth = 10 + strength * 2; // Здоровье зависит от силы
    const maxMana = 5 + intelligence * 2; // Мана зависит от интеллекта
    const movementSpeed = 1 + agility * 0.1; // Скорость передвижения зависит от ловкости

    return {
        maxHealth,
        maxMana,
        movementSpeed
    };
}

// Создание объекта характеристик игрока с базовыми значениями
function initializePlayerAttributes() {
    return {
        strength: 1,
        agility: 1,
        intelligence: 1,
        ...calculateAttributes({ strength: 1, agility: 1, intelligence: 1 })
    };
}

// Обновление атрибутов игрока
function updateAttributes(player, newAttributes) {
    player.strength = newAttributes.strength || player.strength;
    player.agility = newAttributes.agility || player.agility;
    player.intelligence = newAttributes.intelligence || player.intelligence;

    // Пересчитываем связанные параметры
    const calculatedAttributes = calculateAttributes(player);
    player.maxHealth = calculatedAttributes.maxHealth;
    player.maxMana = calculatedAttributes.maxMana;
    player.movementSpeed = calculatedAttributes.movementSpeed;

}
function handleAttributes(socket) {
    socket.on('requestPlayerAttributes', () => {
        const attributes = initializePlayerAttributes();
        socket.emit('playerAttributes', attributes);
    });

    socket.on('updatePlayerAttributes', (newAttributes) => {
        const player = initializePlayerAttributes();
        updateAttributes(player, newAttributes);
        socket.emit('playerAttributesUpdated', player); // Отправка обновлённых атрибутов на клиент
    });
}
module.exports = {
    initializePlayerAttributes,
    updateAttributes,
    handleAttributes
};
