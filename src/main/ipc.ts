import store from './store'
import { openSelectDirDialog } from './api'
import { app, ipcMain, shell, BrowserWindow } from 'electron'
import { aria2RPCClient, setThreadCount } from './server/utils/aria2Download'
import { Status } from './server/type'
import path from 'node:path'

import { openChapterBorwserWindow } from './window/chapter'
import { openLoginBorwserWindow } from './window/login'

ipcMain.handle('setStoreValue', (_event, key, value) => {
  store.set(key, value)
})
ipcMain.on('getStoreValueSync', (event, key) => {
  event.returnValue = store.get(key)
})
ipcMain.on('getMachineId', (event) => {
  event.returnValue = store.get('machineId')
})
ipcMain.on('setSavePath', (event, title, defaultPath) => {
  event.returnValue = openSelectDirDialog(title, defaultPath)
})
ipcMain.once('open-url', (_event, ck, url) => {
  const cb = () => {
    ipcMain.once('open-url', (_event, url, ck) => {
      openChapterBorwserWindow(url, ck, cb)
    })
  }
  openChapterBorwserWindow(url, ck, cb)
})
ipcMain.on('login-show', async (event) => {
  event.reply('login-result', await openLoginBorwserWindow())
})
ipcMain.on('app-relaunch', () => {
  app.relaunch()
  app.exit()
})
ipcMain.on('open-file', (_event, file) => {
  shell.openPath(path.join(file.path, file.name))
})
ipcMain.on('save-settings', (_event, settingstr) => {
  const settings = JSON.parse(settingstr)
  settings.downloadThread && setThreadCount(settings.downloadThread)
})
ipcMain.on('removeStoreValue', (_event, key) => {
  store.delete(key)
})
ipcMain.on('open-folder', (_event, path) => {
  shell.openPath(path)
})
ipcMain.on('close-app', (_event) => {
  app.quit()
})
ipcMain.on('task-status-update', (_event, data: { fileItemId: string; status: Status }) => {
  switch (data.status) {
    case Status.PAUSED:
      aria2RPCClient?.call('pause', data.fileItemId)
      break
    case Status.PENDING:
      aria2RPCClient?.call('unpause', data.fileItemId)
      break
    case Status.CANCELED:
      aria2RPCClient?.call('remove', data.fileItemId)
      break
  }
})
ipcMain.on('fullscreen-app', (_event) => {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win.isMaximized()) {
    win.maximize()
  } else {
    win.unmaximize()
  }
})
ipcMain.on('minimize-app', (_event) => {
  const win = BrowserWindow.getAllWindows()[0]
  win.minimize()
})
