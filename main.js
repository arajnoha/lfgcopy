const { app, BrowserWindow, clipboard, ipcMain, exec } = require('electron');
const path = require('path');
const { execSync } = require('child_process');

let mainWindow;
let clipboardHistory = [];
let clipboardInterval;
let hasInitialized = false; // Flag to check if the app has been initialized

// Function to get the current active app name (macOS only)
function getActiveAppName() {
  try {
    const script = `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`;
    return execSync(script).toString().trim();
  } catch (e) {
    return 'unknown';
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Start clipboard monitoring immediately after the app opens
  startClipboardMonitoring();
}

// Start monitoring clipboard changes
function startClipboardMonitoring() {
  if (!clipboardInterval) {
    clipboardInterval = setInterval(() => {
      let text = clipboard.readText();
      let app = getActiveAppName(); // macOS: Get the app that last copied the text
      let timestamp = new Date().toLocaleString(); // Get the current date and time

      // Only insert new entries after the app has been initialized
      if (text && !hasInitialized) {
        hasInitialized = true; // Set the flag to true after the first check
      } else if (text && (clipboardHistory.length === 0 || clipboardHistory[0].text !== text)) {
        clipboardHistory.unshift({ text, sourceApp: app, timestamp }); // Include the timestamp
        if (clipboardHistory.length > 10) clipboardHistory.pop();
        mainWindow.webContents.send('clipboard-update', clipboardHistory);
      }
    }, 1000);
  }
}

// IPC for setting clipboard text
ipcMain.on('set-clipboard-text', (event, text) => {
  clipboard.writeText(text);
});

// IPC to start monitoring clipboard
ipcMain.on('start-monitoring-clipboard', (event) => {
  startClipboardMonitoring();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
