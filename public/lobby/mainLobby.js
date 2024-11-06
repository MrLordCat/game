import lobbyActions from './lobbyActions.js';
import lobbyUI from './lobbyUI.js';
window.socket = io();
const mainLobby = {
    init: function() {
        console.log('Lobby initialized');
        lobbyUI.init();
        lobbyActions.setupSocketEvents();
    }
};
window.addEventListener('load', () => {
    mainLobby.init();
});
export default mainLobby;
