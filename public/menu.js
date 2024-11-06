// menu.js
// Создаем объект аудио для фоновой музыки
const menuMusic = new Audio('menu-music.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.5;

const mapEditorContainer = document.getElementById('mapEditor');
const toggleMusicButton = document.getElementById('toggleMusic');

// Переход с экрана "Start Game" к меню
document.getElementById('startGame').addEventListener('click', () => {
    startScreen.style.display = 'none';
    menu.style.display = 'block';
    
    menuMusic.play().catch(error => {
        console.log('Autoplay prevented:', error);
    });
});

document.getElementById('createRoom').addEventListener('click', () => {
    const roomName = document.getElementById('roomName').value;
    if (roomName) {
        lobbyActions.createRoom(roomName); // Используем глобальную переменную lobbyActions
    } else {
        console.log('Please enter a room name.');
    }
});

document.getElementById('joinRoom').addEventListener('click', () => {
    const roomName = document.getElementById('roomName').value;
    if (roomName) {
        lobbyActions.joinRoom(roomName); // Используем глобальную переменную lobbyActions
    } else {
        console.log('Please enter a room name.');
    }
});

document.getElementById('mapEditorButton').addEventListener('click', () => {
    menu.style.display = 'none';
    mapEditorInterface.style.display = 'block';
    mapEditorModule.init();
});

document.getElementById('editorReturnToMenu').addEventListener('click', () => {
    mapEditorInterface.style.display = 'none';
    menu.style.display = 'block';
});

document.getElementById('saveMap').addEventListener('click', () => {
    const mapData = mapEditorModule.mapData;
    localStorage.setItem('savedMap', JSON.stringify(mapData));
    alert('Map saved successfully!');
});

toggleMusicButton.addEventListener('click', () => {
    if (menuMusic.paused) {
        menuMusic.play();
        toggleMusicButton.textContent = 'Disable Sound';
    } else {
        menuMusic.pause();
        toggleMusicButton.textContent = 'Enable Sound';
    }
});
