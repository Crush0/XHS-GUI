import { BrowserWindow } from 'electron'
import path from 'node:path'
import icon from '../../../resources/icon.png?asset'
/**
 *
 * @param cookieObjList
 * @returns
 */
const cookieObj2Str = (cookieObjList) => {
  let cookie = ''

  for (let i = 0; i < cookieObjList.length; i++) {
    const { name, value } = cookieObjList[i]
    cookie += `${name}=${value};`
  }

  return cookie
}
let win: BrowserWindow | null = null
export const openLoginBorwserWindow = () => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      if (win) {
        reject('Login window is already opened')
        return
      }
      win = new BrowserWindow({
        width: 1000,
        height: 620,
        resizable: false,
        title: 'XHS-GUI',
        show: true,
        icon: icon,
        titleBarOverlay: {
          color: 'rgba(0,0,0,0)',
          height: 35,
          symbolColor: 'gary'
        },
        webPreferences: {
          preload: path.join(__dirname, '../preload/index.js'),
          sandbox: false,
          nodeIntegration: true
        }
      })
      win.setMenu(null)
      await win.webContents.session.clearCache()
      await win.webContents.session.clearStorageData()
      await win.webContents.session.clearHostResolverCache()
      await win.webContents.session.clearAuthCache()
      win.webContents.executeJavaScript(
        `
              setInterval(() => {
                  const toast = document.querySelector('.reds-toast')
                  if (toast && toast.innerText.startsWith('登录成功')) {
                    window.electron.ipcRenderer.send('login-success')
                  }
                }, 200)
              `
      )
      win.webContents.ipc.on('login-success', async (_event) => {
        const cookies = await win?.webContents.session.cookies.get({})
        await win?.webContents.session.clearCache()
        await win?.webContents.session.clearStorageData()
        await win?.webContents.session.clearHostResolverCache()
        await win?.webContents.session.clearAuthCache()
        resolve(cookieObj2Str(cookies))
        win && win.close()
      })
      // win.once('ready-to-show', () => {
      //   win && win.show()
      // })
      win.on('closed', () => {
        win = null
      })
      win.loadURL('https://www.xiaohongshu.com/login')
    } catch (error) {
      reject(error)
    }
  })
}
