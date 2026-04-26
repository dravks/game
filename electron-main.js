const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Isekai MMORPG Prototype",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Menü çubuğunu gizle (isteğe bağlı)
    autoHideMenuBar: true,
  });

  // index.html dosyasını yükle
  win.loadFile('index.html');

  // Geliştirici araçlarını açmak istersen:
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
