const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onClipboardUpdate: (callback) => ipcRenderer.on('clipboard-update', callback),
  setClipboardText: (text) => ipcRenderer.send('set-clipboard-text', text)
});
