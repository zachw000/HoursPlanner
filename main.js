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

app.on('ready', createWindow);
