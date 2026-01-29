const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3000;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'public/logo.png'),
    titleBarStyle: 'hiddenInset', // macOS style title bar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    backgroundColor: '#ffffff',
    show: false,
  });

  // Load the app
  const startUrl = isDev
    ? `http://localhost:${PORT}`
    : `file://${path.join(__dirname, '.next/server/app/index.html')}`;

  // For production, we'll use a custom server approach
  if (isDev) {
    mainWindow.loadURL(startUrl);
  } else {
    // In production, start a local server
    const { createServer } = require('http');
    const { parse } = require('url');
    const next = require('next');

    const nextApp = next({ dev: false, dir: __dirname });
    const handle = nextApp.getRequestHandler();

    nextApp.prepare().then(() => {
      createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }).listen(PORT, () => {
        mainWindow.loadURL(`http://localhost:${PORT}`);
      });
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create window on macOS when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Disable navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== `http://localhost:${PORT}`) {
      event.preventDefault();
    }
  });
});
