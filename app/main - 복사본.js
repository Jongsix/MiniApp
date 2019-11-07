const {app, BrowserWindow, ipcMain} = require('electron');
const configer = require('./lib/configer.js');
//const conf = configer.load('./app/config/config.json');
var defaultConf = {
  host: '192.168.10.126',
  port: 5001,
  width: 810,
  height: 98,
  develop: true,
  devWidth: 870,
  devHeight: 128,
};
//const conf = configer.load('./config/config.json',defaultConf);  
const conf = configer.load('resources' + '/config/config.json',defaultConf);  // for asar
console.info(`host = ${conf.host}, port = ${conf.port}, params = ${conf.params}`);
    
var dev = true;

function nullFunction(){
  console.log('null function');
}

function popupFactory (url) {
  if(typeof dev!=='undefined' || dev===true) return nullFunction;
  return function(){
    console.log('popup: '+url)
    var win = new BrowserWindow({icon: 'favicon.ico'})
    win.loadURL(url)
    win.on('closed', function () {
      win = null
    })
    app.win = win;
  }
}



mainWindow = null;

function createWindow () {

  //console.log('Hello from electron');
  if(conf.develop){
    mainWindow = new BrowserWindow({width: conf.devWidth, height: conf.devHeight, icon: 'favicon.ico', resizable: true }) 
  }else{
    mainWindow = new BrowserWindow({width: conf.width, height: conf.height, icon: 'favicon.ico', resizable: false }) 
  }
  // and load the index.html of the app.
  //mainWindow.loadURL(`file://${__dirname}/index.html`)
  //mainWindow.loadURL('http://123.111.173.50:5001/websocket.html?userid=1700&phone=1700')

  //mainWindow.loadURL('http://123.111.173.50:5001/electron.html')
  mainWindow.loadURL(`http://${conf.host}:${conf.port}/electron.html`)

  // Open the DevTools.
  if(conf.develop){
    mainWindow.webContents.openDevTools();  /*최종본:막아*/
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

  if (process.platform !== 'darwin') {
    app.quit();
  }
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

ipcMain.on('popup', function(event, arg) {
  if (arg === ''){ arg = null; }
  else setTimeout(popupFactory(arg),10);
});