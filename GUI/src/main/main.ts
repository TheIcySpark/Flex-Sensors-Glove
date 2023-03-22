/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import * as tf from '@tensorflow/tfjs';
import { ReadlineParser, SerialPort } from 'serialport';
import * as fs from 'fs'
require('@tensorflow/tfjs-node');
const { DelimiterParser } = require('@serialport/parser-delimiter')

var serialPort: SerialPort;
var serialPortParser: any

var model: tf.Sequential;
var modelDirectoryPath: string;

interface IAlphabetData{
  outputs: string,
  xs: Array<Array<number>>
  ys: Array<Array<number>>
}

async function initializeSerialPort(){
  const ports =  await SerialPort.list();
  if(ports.length > 0){
    serialPort = new SerialPort({
      path: ports[0].path,
      baudRate: 9600,
    });
    setSerialPort();
  }
}

function setSerialPort(){
  serialPortParser = serialPort.pipe(new ReadlineParser())

  serialPort.on('error', function(error: Error){
    mainWindow?.webContents.send('serial-port-error', error);
  })
  
  serialPort.on('open', function(){
    mainWindow?.webContents.send('serial-port-opened', serialPort.path);
  })
  
  serialPortParser.on('data', function(data: string){
    mainWindow?.webContents.send('serial-port-data-readed', data);
  })
  
  serialPort.on('close', function(){
    mainWindow?.webContents.send('serial-port-closed', serialPort.path);
  })
}

async function sendCode(event: any, code: string){
  if(!serialPort) return;
  if(!serialPort.isOpen){
    serialPort.open();
    setTimeout(() =>{
      
    }, 100)
  }
  serialPort.write(code);
}

async function reloadAvailableDevices(){
  return await SerialPort.list()
}

async function openPort(event: any, path: string){
  if(!path){
    return;
  }
  if(serialPort && serialPort.isOpen){
    serialPort.close();
  }
  setTimeout(() =>{
    serialPort = new SerialPort({
      path: path,
      baudRate: 9600,
    });
    setSerialPort();
  }, 100)
  
}

function compileModel(){
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['accuracy'],
  });
}

async function saveNewModel(event: any, alphabet: string){
  return dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(async result =>{
    if(result.canceled){
      return;
    }
    const alphabetSize = alphabet.split(' ').length;
    model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [5], units: alphabetSize * 10, useBias: true, activation: 'relu' }));
    model.add(tf.layers.dense({ units: alphabetSize * 5, activation: 'relu' }));
    model.add(tf.layers.dense({ units: alphabetSize, activation: 'softmax' }));
  
    compileModel();

    modelDirectoryPath = result.filePaths[0].replace(/\\/g, '/');

    const alphabetData: IAlphabetData = {outputs: alphabet, xs: [], ys: []}

    fs.writeFileSync(modelDirectoryPath + '/alphabetData.json', JSON.stringify(alphabetData));

    await model.save('file://' + modelDirectoryPath);

    return modelDirectoryPath;
  })
}

async function loadModel(){
  return dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {name: 'Models', extensions: ['json']}
    ]
  }).then(async result =>{
    if(result.canceled){
      return;
    }
    modelDirectoryPath = result.filePaths[0].replace(/\\/g, '/')
    modelDirectoryPath = modelDirectoryPath.replace(/\/model.json/, '');
    
    model = await tf.loadLayersModel('file://' + modelDirectoryPath + '/model.json') as tf.Sequential;
    return [modelDirectoryPath, (JSON.parse(fs.readFileSync(modelDirectoryPath + '/alphabetData.json').toString()) as IAlphabetData).outputs]
  })
}

async function sendDataToDataSet(event: any, gloveInputs: Array<number>, desiredOutput: string){
  var data = JSON.parse(fs.readFileSync(modelDirectoryPath + '/alphabetData.json').toString()) as IAlphabetData;
  data.xs.push(gloveInputs);
  const alphabet = data.outputs.split(' ');
  const desiredOutputIndex = alphabet.indexOf(desiredOutput);
  data.ys.push(Array(alphabet.length).fill(0));
  data.ys[data.ys.length - 1][desiredOutputIndex] = 1;
  fs.writeFileSync(modelDirectoryPath + '/alphabetData.json', JSON.stringify(data));
}

async function trainModel(){
  const data = JSON.parse(fs.readFileSync(modelDirectoryPath + '/alphabetData.json').toString()) as IAlphabetData;
  const {inputs, labels} =  tf.tidy(() =>{
    const inputTensor = tf.tensor(data.xs);
    const labelTensor = tf.tensor(data.ys);
    
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));

    return{
      inputs: normalizedInputs,
      labels: labelTensor
    }
  })

  compileModel();

  await model.fit(inputs, labels, {
    epochs: 100,
  }).then(info =>{
    console.log(info)
  })
}

async function predictResponse(event: any, gloveInputs: Array<number>){
  const data = JSON.parse(fs.readFileSync(modelDirectoryPath + '/alphabetData.json').toString()) as IAlphabetData;

  const {inputs} =  tf.tidy(() =>{
    const inputTensor = tf.tensor(gloveInputs);
    
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));

    return{
      inputs: normalizedInputs,
    }
  })
  const response = model.predict(inputs.reshape([1, 5])) as tf.Tensor
  const letterIndex = response.argMax(1).dataSync()[0]

  return data.outputs.split(' ')[letterIndex]
}

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.maximize();

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.handle('save-new-model', saveNewModel);
    ipcMain.handle('load-model', loadModel);
    ipcMain.handle('reload-available-devices', reloadAvailableDevices);
    ipcMain.handle('train-model', trainModel);
    ipcMain.handle('predict-response', predictResponse);
    ipcMain.on('send-data-to-data-set', sendDataToDataSet);
    ipcMain.on('open-port', openPort);
    initializeSerialPort();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
