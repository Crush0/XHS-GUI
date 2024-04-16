import { app, shell, BrowserWindow } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { start as startServer } from './server'
import './init'
import './ipc'
const additionalData = { xhsgui: 'xhs-gui' }

const gotTheLock = app.requestSingleInstanceLock(additionalData)
if (!gotTheLock) {
  app.quit()
} else {
  app.commandLine.appendSwitch('lang', 'zh-CN')
  function createWindow(): void {
    const mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      titleBarStyle: 'hiddenInset',
      title: 'XHS-GUI',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      startServer()
      mainWindow.show()
    })
    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
  }
  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.hithub.crush0.xhs-gui')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

