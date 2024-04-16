import { ElectronAPI } from '@electron-toolkit/preload'
import { type CustomAPI } from '../main/api'
declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
