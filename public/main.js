// menu.js


// Переменные для управления экраном
const startScreen = document.getElementById('startScreen');
const menu = document.getElementById('menu');

// Переход с экрана "Start Game" к меню
document.getElementById('startGame').addEventListener('click', () => {
    startScreen.style.display = 'none';
    menu.style.display = 'block';
    
    // Запускаем музыку после перехода в меню
    menuMusic.play().catch(error => {
        console.log('Autoplay prevented:', error);
    });
});

// Настраиваем кнопку включения/выключения звука
toggleMusicButton.addEventListener('click', () => {
    if (menuMusic.paused) {
        menuMusic.play();
        toggleMusicButton.textContent = 'Disable Sound';
    } else {
        menuMusic.pause();
        toggleMusicButton.textContent = 'Enable Sound';
    }
});
