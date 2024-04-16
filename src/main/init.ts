import { app } from 'electron'
import mid from 'node-machine-id'
import path from 'node:path'
import store from './store';
;(function initStore() {
  store.set('machineId', mid.machineIdSync())
  if (!store.has('settings')) {
    const defaultSettings = {
      downloadPath: path.join(app.getPath('downloads'), 'XHS-GUI'),
      downloadPorxy: {
        enable: false,
        url: ''
      },
      downloadThread: 5,
      downloadComment: false,
      version: app.getVersion()
    }
    store.set('settings', JSON.stringify(defaultSettings))
  } else {
    store.set(
      'settings',
      JSON.stringify({
        ...JSON.parse(store.get('settings') as string),
        version: app.getVersion()
      })
    )
    
  }
})()

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})
