const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onAppInfo: (callback) => ipcRenderer.on('app-info', (event, info) => callback(info)),
  openChat: () => ipcRenderer.send('open-chat'),
});
