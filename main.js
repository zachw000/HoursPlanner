/*jshint esversion: 6 */
const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

let win;

var createWindow = function() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL(url.format ({
    pathname: path.join(__dirname, 'views/index.html'),
    protocol: 'file:',
    slashes: true
  }));
};

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', createWindow);
