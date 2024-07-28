import { app, BrowserWindow, dialog, ipcMain, shell, Menu, clipboard, globalShortcut, Notification, Tray } from 'electron';
// import { ipcMain, Menu } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { dirname } from 'node:path';
import { join } from 'path';
import { fileURLToPath } from 'node:url';
import { create } from 'domain';
import Positioner from 'electron-positioner';

// Main is an mjs file so we can use import.meta.url
const __dirname = dirname(fileURLToPath(import.meta.url));

let tray = null;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minHeight: 400,
    maxHeight: 800,
    minWidth: 300,
    maxWidth: 450,
    maximizable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    show: false,
    webPreferences: {
      sandbox: false,
      // This points to the preload.mjs file in the vite build
      preload: join(__dirname, 'preload.mjs'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    // showOpenDialog(mainWindow);
  });

  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  return mainWindow;
};

// app.on('ready', createWindow);

app.whenReady().then(() => {
  const browserWindow = createWindow();

  // const contextMenu = Menu.buildFromTemplate([
  //   {
  //     label: 'Show Window',
  //     click: () => {
  //       browserWindow.show();
  //       browserWindow.focus();
  //     },
  //   },
  //   {
  //     label: 'Quit',
  //     role: 'quit',
  //   },
  // ]);

  tray = new Tray(join('./src/icons/trayTemplate.png'));
  tray.setIgnoreDoubleClickEvents(true);

  const positioner = new Positioner(browserWindow);

  // tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (!tray) return;
    if (browserWindow.isVisible()) {
      return browserWindow.hide();
    }
    const trayPosition = positioner.calculate('center', tray.getBounds());
    browserWindow.setPosition(trayPosition.x, trayPosition.y, false);
    browserWindow.show();
  });

  globalShortcut.register('CommandOrControl+Shift+Alt+C', () => {
    app.focus();
    browserWindow.show();
    browserWindow.focus();
  });

  globalShortcut.register('CommandOrControl+Shift+Alt+X', () => {
    let content = clipboard.readText();
    content = content.toUpperCase();
    clipboard.writeText(content);
    new Notification({
      title: 'Capitalized Clipboard',
      subtitle: 'Copied to clipboard',
      body: content,
    }).show();
  });
});

app.on('quit', () => {
  globalShortcut.unregisterAll();
});

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

ipcMain.on('write-to-clipboard', (_, content) => {
  clipboard.writeText(content);
});

ipcMain.handle('read-from-clipboard', (_) => {
  return clipboard.readText();
});
