const electronStore = {
  setStr: async (key: string, value: string): Promise<void> => {
    await window.electron.ipcRenderer.invoke('setStoreValue', key, value)
  },
  getStrSync: (key: string): string => {
    return window.electron.ipcRenderer.sendSync('getStoreValueSync', key)
  },
  removeStr: async (key: string): Promise<void> => {
    await window.electron.ipcRenderer.invoke('removeStoreValue', key)
  }
}
export default electronStore
