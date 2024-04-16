import { createRouter, createWebHashHistory } from 'vue-router'
const route = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      keepAlive: true,
      showSider: true,
      auth: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      keepAlive: false,
      showSider: true,
      auth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      keepAlive: false,
      showSider: true,
      auth: true
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/Help.vue'),
    meta: {
      keepAlive: false,
      showSider: true,
      auth: true
    }
  },
  {
    path: '/downloadManager',
    name: 'DownloadManager',
    component: () => import('../views/DownloadManager.vue'),
    meta: {
      keepAlive: true,
      showSider: true,
      auth: true
    }
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes: route
})
