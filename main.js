const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
app.setName('XTabout')
const path = require('path');
const { setupSystemInfo } = require('./src/scripts/info');
const config = require('./src/scripts/config');

let mainWindow;

function createMenu() {
  const template = [

    {
      label: 'XTabout',
      submenu: [

        { label: 'GitHub',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/plvxt/XTabout');
          }
        },
        { label: 'YouTube',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://youtube.com/@xfii_');
          }
        },
        { type: 'separator' },
        { role: 'about' },
        { role: 'reload' },
        { role: 'quit' }
      ]
    },
    {
      label: '🐰',
      submenu: [
        {
          label: 'Cambiar imagen',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'PNG', extensions: ['png'] }]
            });
            if (!result.canceled && result.filePaths.length > 0) {
              try {
                const imagePath = config.saveCustomImage(result.filePaths[0]);
                mainWindow.webContents.send('update-image', imagePath);
              } catch (error) {
                dialog.showErrorBox('Error', error.message);
              }
            }
          }
        },
        {
          label: 'Editar título',
          click: () => {
            mainWindow.webContents.send('edit-title');
          }
        },
        {
          label: 'Editar modelo',
          click: () => {
            mainWindow.webContents.send('edit-model');
          }
        },
        { type: 'separator' },
        {
          label: 'Borrar imagen',
          click: async () => {
            const response = await dialog.showMessageBox(mainWindow, {
              type: 'question',
              buttons: ['Cancelar', 'Borrar'],
              defaultId: 0,
              title: 'Confirmar borrado',
              message: '¿Estás seguro de que quieres borrar la imagen personalizada?'
            });

            if (response.response === 1) {
              try {
                if (config.deleteCustomImage()) {
                  mainWindow.webContents.send('update-image', path.join(__dirname, 'src/media/default.png'));
                }
              } catch (error) {
                dialog.showErrorBox('Error', 'No se pudo borrar la imagen');
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Número de Serie',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('toggle-serial-number');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 329,
    height: 514,
    backgroundColor: '#2e2e2e00',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    resizable: false,
    transparent: true,
    hasShadow: true,
    fullscreenable: false,
    vibrancy: 'fullscreen-ui',
    visualEffectState: 'active',
    icon: path.join(__dirname, '/src/media/LogoFinal.icns')
  });


  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('save-config', (event, newConfig) => {
  config.saveConfig(newConfig);
});

ipcMain.on('get-config', (event) => {
  event.returnValue = config.getConfig();
});

ipcMain.on('get-custom-image', (event) => {
  const imagePath = config.getCustomImagePath();
  event.returnValue = imagePath || null;
});

app.whenReady().then(() => {
  app.setName('XTabout');
  createWindow();
  createMenu();
  setupSystemInfo();

  ipcMain.on('window-controls', (event, action) => {
    if (!mainWindow) return;
    
    switch(action) {
      case 'close':
        app.quit();
        break;
    }
  });

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