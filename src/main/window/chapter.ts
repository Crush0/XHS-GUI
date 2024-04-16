import { BrowserWindow } from 'electron'
import path from 'node:path'
import icon from '../../../resources/icon.png?asset'
import { cookieStr2Obj } from '../api'
let win: BrowserWindow | null = null
export const openChapterBorwserWindow = (url: string, cookieStr: any, cb: any) => {
  if (win) {
    return
  }
  win = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    title: 'XHS-GUI',
    icon: icon,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0,0,0,0)',
      height: 35,
      symbolColor: 'white'
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    }
  })
  win.setMenu(null)
  if (cookieStr) {
    const cookies = cookieStr2Obj(cookieStr)
    for (const key in cookies) {
      win.webContents.session.cookies.set({
        name: key,
        value: cookies[key],
        url: 'https://www.xiaohongshu.com',
        domain: '.xiaohongshu.com',
        path: '/'
      })
    }
  }
  win.webContents.ipc.on('close-window', () => {
    win && win.close()
  })
  win.webContents.executeJavaScript(
    `
      setInterval(() => {
        if (document.querySelector('.onix-toast')) {
          window.electron.ipcRenderer.send('close-window')
        }
      }, 200)
      `
  )
  win.loadURL(url)
  win.on('closed', () => {
    cb()

    win = null
  })
}
