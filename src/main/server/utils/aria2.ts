import { Aria2RPC } from 'node-aria2'
import { spawn } from 'child_process'
import store from '../../store'
import { app } from 'electron'
import path from 'path'
import fs from 'node:fs'
import { mkdirsSync } from '../XHSRequests/utils'
const userPath = app.getPath('userData')
const exePath = path.dirname(app.getPath('exe'))
import aria2ServerDev from '../../../../resources/aria2c.exe?asset'
const aria2Server = path.join(exePath, 'resources', 'resources', 'aria2c.exe')
// 是否为开发环境
const isDev = process.env.NODE_ENV === 'development'
mkdirsSync(path.join(userPath, 'aria2'))
fs.existsSync(path.join(userPath, 'aria2', 'aria2.session')) ||
  fs.writeFileSync(path.join(userPath, 'aria2', 'aria2.session'), '')
;(function startAria2(): void {
  const settings = JSON.parse((store.get('settings') as string) || '{}')
  spawn(isDev ? aria2ServerDev : aria2Server, [
    '--dir',
    settings.downloadPath,
    '--disk-cache',
    '64M',
    '--input-file',
    path.join(userPath, 'aria2', 'aria2.session'),
    '--save-session',
    path.join(userPath, 'aria2', 'aria2.session'),
    '--save-session-interval',
    '1',
    '--auto-save-interval',
    '20',
    '--max-concurrent-downloads',
    `${settings.downloadThread}`,
    '--max-connection-per-server',
    '16',
    '--split',
    '64',
    '--min-split-size',
    '4M',
    '--allow-piece-length-change',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    '--enable-rpc',
    '--rpc-listen-all',
    '--rpc-allow-origin-all',
    '--rpc-listen-all',
    '--rpc-listen-port',
    '6800',
    '--rpc-secret',
    'xhs-gui',
    '--rpc-max-request-size',
    '100M'
  ])
})()

export default function openAria2(): Promise<Aria2RPC | undefined> {
  return new Promise((resolve, reject) => {
    const aria2 = new Aria2RPC({
      host: 'localhost',
      port: 6800,
      secret: 'xhs-gui',
      path: '/jsonrpc',
      secure: false
    })
    aria2
      .open()
      .then(() => {
        resolve(aria2)
      })
      .catch(() => {
        reject(undefined)
      })
  })
}
