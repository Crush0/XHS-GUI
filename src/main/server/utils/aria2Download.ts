import { Aria2RPC } from 'node-aria2'
import { AriaDownloadOption, Status } from '../type'
import openAria2 from './aria2'
import store from '../../store'
import { BrowserWindow } from 'electron'
import logger from '../../logger'
export let aria2RPCClient: Aria2RPC | undefined = undefined
;(async function initEmitter() {
  aria2RPCClient = await openAria2()
  const notifications = await aria2RPCClient?.listNotifications()
  notifications.forEach((notification) => {
    aria2RPCClient?.on(notification, ([guid]) => {
      switch (notification) {
        case 'onDownloadStart':
          processCallBack(guid.gid, 0, Status.DOWNLOADING)
          const interval = setInterval(() => {
            aria2RPCClient
              ?.call('tellStatus', guid.gid, ['totalLength', 'completedLength', 'status'])
              .then(({ completedLength, totalLength, status }) => {
                if (status === 'active') {
                  const progress = (completedLength / totalLength) * 100
                  processCallBack(guid.gid, progress, Status.None)
                  if (progress >= 100) {
                    processCallBack(guid.gid, progress, Status.FINISHED)
                    clearInterval(interval)
                  }
                } else if (status === 'paused' || status === 'error') {
                  processCallBack(guid.gid, -1, status)
                  clearInterval(interval)
                } else if (status === 'waiting') {
                  processCallBack(guid.gid, 0, Status.PENDING)
                  clearInterval(interval)
                }
              })
              .catch((err) => {
                console.error(err)
              })
          }, 100)
          break
        case 'onDownloadComplete':
          logger.info(`Aria2 Download [GID=${guid.gid}] completed`)
          processCallBack(guid.gid, 100, Status.FINISHED)
          break

        case 'onDownloadError':
          processCallBack(guid.gid, -1, Status.ERROR)
          break
        case 'onDownloadPause':
          processCallBack(guid.gid, -1, Status.PAUSED)
          break
      }
    })
  })
})()
const processCallBack = (fid: string, progress: number, status: Status) => {
  BrowserWindow.getAllWindows()[0].webContents.send('update-file-progress', {
    fid,
    progress,
    status
  })
}
export const setThreadCount = (count: number) => {
  aria2RPCClient?.call('changeGlobalOption', { 'max-concurrent-downloads': count })
}
const download = (url: string, options: AriaDownloadOption) => {
  const settings = JSON.parse((store.get('settings') || '') as string)
  const { enable: enableProxy, url: proxyUrl } = settings.downloadPorxy
  if (enableProxy && proxyUrl !== '') {
    options = {
      ...options,
      [proxyUrl.startsWith('https') ? 'https-proxy' : 'http-proxy']: proxyUrl
    }
  }
  aria2RPCClient?.call('addUri', [url], options)
}
export default download
