import { BrowserWindow, dialog } from 'electron/main'

export const openSelectDirDialog = (title: string, defaultPath: string) => {
  return dialog.showOpenDialogSync(BrowserWindow.getAllWindows()[0], {
    title: title,
    defaultPath: defaultPath,
    properties: ['openDirectory']
  })
}
export const cookieStr2Obj = (cookieStr: string) => {
  const cookies = cookieStr.split(';')
  const obj = {} as Map<string, string>
  cookies.forEach((item) => {
    const [key, value] = item.split('=')
    obj[key.trim()] = value
  })
  return obj
}
