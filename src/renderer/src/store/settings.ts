import { defineStore } from 'pinia'
// import Request from '../request'
export const useSettingStore = defineStore('settings', {
  state: () => ({
    downloadPath: '',
    downloadPorxy: {
      enable: false,
      url: ''
    },
    downloadThread: 1,
    version: '1.0.0',
    downloadComment: true,
  }),
  persist: true,
  getters: {
    getSettings: (state) => state
  },
  actions: {
    fetchSystemSettings() {},
    setSetting(settings) {
      this.downloadPath = settings.downloadPath
      this.downloadPorxy.enable = settings.downloadPorxy.enable
      this.downloadPorxy.url = settings.downloadPorxy.url
      this.downloadThread = settings.downloadThread
      this.downloadComment = settings.downloadComment
    }
  }
})
