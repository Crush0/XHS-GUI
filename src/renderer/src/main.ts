import { createApp } from 'vue'
import App from './App.vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'
import './assets/main.css'
import router from './router'
import { Notification, Modal } from '@arco-design/web-vue'
import store from './store'
import { VueMasonryPlugin } from 'vue-masonry'
const app = createApp(App)
Notification._context = app._context
Modal._context = app._context
app.use(router)
app.use(ArcoVueIcon)
app.use(VueMasonryPlugin)
app.use(store)
app.mount('#app')
