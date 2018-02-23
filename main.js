/*jshint esversion: 6 */
const {session, app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');
const ejse = require('ejs-electron');
/*
let win;

var createWindow = function() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL(url.format ({
    pathname: path.join(__dirname, 'views/index.html'),
    protocol: 'file:',
    slashes: true
  }));
};
*/
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL('file://' + __dirname + '/views/index.ejs');
    global.ses = mainWindow.webContents.session;
});

app.on('window-all-closed', () => {
  app.quit();
});
//module.start = function() {
//  createWindow();
//};
