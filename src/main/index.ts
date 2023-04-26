import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import Runs from './db/runs';
import log from 'electron-log';
const devUrl = 'http://localhost:3000';
enum SYSTEMS {
  WINDOWS = 'win32',
  LINUX = 'debian',
  MACOS = 'darwin',
}

// Optional, initialize the logger for any renderer processses
log.initialize({ preload: true });

const createWindow = () => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      webSecurity: false,
    },
    show: false,
  });

  require('electron-reload')(__dirname, {
    electron: path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      '.bin',
      'electron' + (process.platform === SYSTEMS.WINDOWS ? '.cmd' : '')
    ),
    // forceHardReset: true,
    hardResetMethod: 'exit',
  });

  /**
   * Expose main process variables
   */
  ipcMain.on('app-globals', (e) => {
    const appPath = __dirname;
    const appLocale = app.getLocale();

    e.returnValue = {
      appPath,
      appLocale,
    };
  });

  ipcMain.handle('load-runs', async (e, { size }) => {
    const runs = await Runs.getLastRuns(size);
    console.log(size);
    // console.log(runs);
    return runs;
  });

  ipcMain.handle('load-run', async (e, { runId }) => {
    const run = await Runs.getRun(runId);
    // console.log(runs);
    return run;
  });

  ipcMain.handle('load-run-details', async (e, { runId }) => {
    const run = await Runs.getRun(runId);
    return run;
  });

  // setInterval(() => {
  //   win.webContents.send('refresh-runs'); // Change this to depend on when stuff changes in db
  // }, 3000);

  win.on('close', (e: Event) => {
    return;
    // if (!isQuitting) {
    //   e.preventDefault();
    //   win.hide();
    //   e.returnValue = false;
    // }
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadURL(devUrl);
};

app.on('ready', createWindow);
