const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      contextIsolation: true,
    },
    title: 'Deepfake Detection Desktop',
  });

  const indexPath = path.join(__dirname, '..', 'build', 'index.html');
  if (!fs.existsSync(indexPath)) {
    dialog.showErrorBox(
      'Frontend build missing',
      'Run "npm run build" inside the frontend/ directory before launching the desktop shell.'
    );
    mainWindow.loadURL('data:text/html,<h2>Missing frontend build</h2>');
    return;
  }

  mainWindow.loadFile(indexPath);
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
