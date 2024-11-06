import mapManager from './mapManager.js';

const mapStorage = {
    init: function() {},

    saveMapToFile: function() {
        const mapDataString = JSON.stringify(mapManager.mapData);
        const blob = new Blob([mapDataString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `customMap.json`;
        link.click();
    }
};

export default mapStorage;
