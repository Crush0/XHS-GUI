import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import electronStore from '@renderer/store/electron-store'

const store = createPinia()
store.use(
  createPersistedState({
    storage: {
      setItem: (key: string, value: string) => {
        return electronStore.setStr(key, value)
      },
      getItem: (key: string) => {
        return electronStore.getStrSync(key)
      },
    }
  })
)
export default store
