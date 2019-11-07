const {app, BrowserWindow, ipcMain} = require('electron');
const contextMenu = require('electron-context-menu');
const configer = require('./lib/configer.js');
const windowStateKeeper = require('electron-window-state');
const log = require('electron-log'); 
const isRunningInAsar = require('electron-is-running-in-asar');
const child = require('child_process').execFile;
const fs = require('fs');
var iePopupFile = null;
var conf = null;
//const conf = configer.load('./config/config.json',defaultConf);

//log.info('process.env',process.env); 

contextMenu({
	prepend: (defaultActions, params, browserWindow) => [{
		label: 'Rainbow',
		// Only show it when right-clicking images
		visible: params.mediaType === 'image'
	}]
});

if (isRunningInAsar()) {
  console.log('Running the app from inside an asar package!');
  conf = configer.load('./resources' + '/config/config.json');  // for asar 'app' folder is 'resources'
                                        // %USERPROFILE%\AppData\Local\Programs\StarteraApp\resources\config\config.json
                                        // %USERPROFILE%\AppData\Local\Programs\TeleStarApp\1.0.2\resources\config\config.json
  iePopupFile   = './resources' + '/config/iepopup.js';
}else{
  conf        = configer.load('./config/config.json');
  iePopupFile = './config/iepopup.js';
}

console.info(`host = ${conf.host}, index = ${conf.index}, port = ${conf.port}, params = ${conf.params}`);

//var dev = true;

function nullFunction(){
  console.log('null function');
}

function popupFactory (url,params) {
  //if(typeof dev!=='undefined' || dev===true) return nullFunction;
  return function(){
    console.log(`[popupFactory]url=${url}`);
    let winParams = {icon: 'favicon.ico', webPreferences:{ nativeWindowOpen: true, nodeIntegration: true }, show:false };
    if(params) Object.assign(winParams,params);
    let win = new BrowserWindow(winParams);
    win.loadURL(url);
    win.once('ready-to-show', () => {
      win.show();
    });
    win.on('closed', function () {
      win = null
    })
    app.win = win;
  }
}

let cbakWin = null;
function popupCbakWinFactory (url,params) {
  //if(typeof dev!=='undefined' || dev===true) return nullFunction;
  return function(){
    console.log(`[popupFactory]url=${url}`);
    let winParams = {icon: 'favicon.ico', webPreferences:{ nativeWindowOpen: true, nodeIntegration: true }, show:false };
    let target = null;
    if(params._target){
      target = params._target;
      delete params._target;
      console.log(`[popupCbakWinFactory]target=${target}`);
    }
    if(params) Object.assign(winParams,params);
    if(cbakWin){
      console.log('[popupCbakWinFactory]Refresh CbakWin!!');
    }else{
      console.log('[popupCbakWinFactory]Create CbakWin!!');
      cbakWin = new BrowserWindow(winParams);
      cbakWin.name = target;
    }
    cbakWin.loadURL(url);
    cbakWin.once('ready-to-show', () => {
      cbakWin.show();
    });
    cbakWin.on('closed', function () {
      cbakWin = null
    })
    //app.cbakWin = cbakWin;
  }
}

function popupIEFactory (url) {
  //var executablePath = `C:\\Windows\\System32\\wscript.exe "${iePopupFile}" "${url}"`;
  //var executablePath = `wscript.exe "${iePopupFile}" "${url}"`;
  var executablePath = "C:\\Windows\\System32\\wscript.exe";
  console.log(`[popupIEFactory] url = ${url}`);
  return function(){
    child(executablePath,[iePopupFile,url], function(err, data) {
        if(err){
           console.error(err);
           return;
        }
        console.log(data.toString());
    });
  }
}

function popupIEColseFactory (url,timeoutMS) {
  //var executablePath = `C:\\Windows\\System32\\wscript.exe "${iePopupFile}" "${url}"`;
  //var executablePath = `wscript.exe "${iePopupFile}" "${url}"`;
  var executablePath = "C:\\Windows\\System32\\wscript.exe";
  console.log(`[popupIEColseFactory] url = ${url}`);
  return function(){
    child(executablePath,[iePopupFile,url,timeoutMS], function(err, data) {
        if(err){
           console.error(err);
           return;
        }
        console.log(data.toString());
    });
  }
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow () {
  var cfg = {width: conf.width, height: conf.height, icon: 'favicon.ico', resizable: false };
  if(conf.develop){
    cfg = {width: conf.devWidth, height: conf.devHeight, icon: 'favicon.ico', resizable: true };
  }

  let mainWindowState = windowStateKeeper({
    defaultWidth: conf.width,
    defaultHeight: conf.height
  });
  
  cfg.webPreferences = { 
    nativeWindowOpen: true, 
    nodeIntegration: true,
    webSecurity: false,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true,
    javascript: true,
    experimentalFeatures: true
  };
  cfg.fullscreenable = false;
  cfg.maximizable = false;
  cfg.minimizable = true;
  cfg.autoHideMenuBar = true;
  cfg.x = mainWindowState.x;
  cfg.y = mainWindowState.y;
  
  console.log('[createWindow] cfg',cfg);
  mainWindow = new BrowserWindow(cfg);

  conf.protocol = conf.protocol || 'http';
  var url = `${conf.protocol}://${conf.host}:${conf.port}/${conf.index}`;
  console.log(`[createWindow] url = ${url}`);
  if(conf.params){
    let pp = [];
    Object.keys(conf.params).forEach(function(k){ pp.push(`${k}=${conf.params[k]}`); });
    if(pp.length>0) url = `${url}?${pp.join('&')}`
  }
  mainWindow.loadURL(url);

  // Open the DevTools.
  if(conf.develop){
    mainWindow.webContents.openDevTools();
  }
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    app.quit();
  })
  app.mainWindow = mainWindow;
}


app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q

  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (mainWindow === null) {
    createWindow();
  }
})

if(typeof conf.develop==='undefined' || !conf.develop){
  app.on('browser-window-created',function(e,window) {
      window.setMenu(null);
  });
}


/*
var promptResponse
ipcMain.on('prompt', function(eventRet, arg) {
promptResponse = null
var promptWindow = new BrowserWindow({
width: 200,
height: 100,
show: false,
resizable: false,
movable: false,
alwaysOnTop: true,
frame: false
})
arg.val = arg.val || ''
const promptHtml = '<label for="val">' + arg.title + '</label>\
<input id="val" value="' + arg.val + '" autofocus />\
<button onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'val\').value);window.close()">Ok</button>\
<button onclick="window.close()">Cancel</button>\
<style>body {font-family: sans-serif;} button {float:right; margin-left: 10px;} label,input {margin-bottom: 10px; width: 100%; display:block;}</style>'
promptWindow.loadURL('data:text/html,' + promptHtml)
promptWindow.show()
promptWindow.on('closed', function() {
eventRet.returnValue = promptResponse
promptWindow = null
})
});

ipcMain.on('prompt-response', function(event, arg) {
if (arg === ''){ arg = null }
promptResponse = arg
});
*/

ipcMain.on('popupChrome', function(event, url, args) {
  setTimeout(popupFactory(url,args),10);
});

ipcMain.on('popup', function(event, arg) {
  if (arg === ''){ arg = null; }
  else setTimeout(popupIEFactory(arg),10);
});

ipcMain.on('popupClose', function(event, url,timeoutMS) {
  if (url === ''){ url = null; }
  else setTimeout(popupIEColseFactory(url,timeoutMS),10);
});

ipcMain.on('popupCbakWin', function(event, url, args) {
  setTimeout(popupCbakWinFactory(url,args),10);
});

ipcMain.on('writePhonebook', function(event, url, args) {
  fs.writeFile(phoneBookFile, JSON.stringify(phoneBook,null,4));
});