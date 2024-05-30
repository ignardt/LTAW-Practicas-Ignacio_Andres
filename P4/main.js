const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { networkInterfaces } = require('os');

function getLocalIP() {
  const nets = networkInterfaces();
  let results = {};
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  return results[Object.keys(results)[0]][0];
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  win.loadFile('info.html');
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('app-info', {
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      electronVersion: process.versions.electron,
      ipAddress: getLocalIP()
    });
  });

  ipcMain.on('open-chat', () => {
    win.loadFile('index.html');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
