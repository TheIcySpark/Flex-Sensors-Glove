// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

const arduinoAPI = {
  onSerialPortError: (
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => ipcRenderer.on('serial-port-error', callback),
  onSerialPortOpened: (
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => ipcRenderer.on('serial-port-opened', callback),
  onSerialPortClosed: (
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => ipcRenderer.on('serial-port-closed', callback),
  onSerialPortDataReaded: (
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => ipcRenderer.on('serial-port-data-readed', callback),
  saveNewModel: (alphabet: string) =>
    ipcRenderer.invoke('save-new-model', alphabet),
  loadModel: () => ipcRenderer.invoke('load-model'),
  reloadAvailableDevices: () => ipcRenderer.invoke('reload-available-devices'),
  openPort: (port: string) => ipcRenderer.send('open-port', port),
  sendDataToDataSet: (gloveInputs: Array<number>, desiredOutput: string) => ipcRenderer.send('send-data-to-data-set', gloveInputs, desiredOutput),
  trainModel: () => ipcRenderer.invoke('train-model'),
  predictResponse: (gloveInputs: Array<number>) => ipcRenderer.invoke('predict-response', gloveInputs)
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('arduinoAPI', arduinoAPI);

export type ElectronHandler = typeof electronHandler;

export type ArduinoAPI = typeof arduinoAPI;
