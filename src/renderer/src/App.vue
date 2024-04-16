<template>
  <Updater />
  <a-layout style="width: 100%; height: 100%">
    <a-layout-header
      ><div class="header">
        <div class="logo">
          <img :src="logo" alt="logo" style="width: 24px" />
          <p>XHS-GUI</p>
        </div>
        <div class="btn">
          <a-space>
            <a-button
              shape="circle"
              size="mini"
              type="secondary"
              status="normal"
              @click="minisizeAPP"
            >
              <template #icon>
                <icon-minus />
              </template>
            </a-button>
            <a-button
              shape="circle"
              size="mini"
              type="primary"
              status="warning"
              @click="fullscreenAPP"
            >
              <template #icon>
                <icon-fullscreen />
              </template>
            </a-button>
            <a-button shape="circle" size="mini" type="primary" status="danger" @click="closeAPP">
              <template #icon>
                <icon-close />
              </template>
            </a-button>
          </a-space>
        </div></div
    ></a-layout-header>
    <a-layout>
      <a-layout-sider v-if="$route.meta.showSider" style="width: 260px"
        ><Menu class="menu"></Menu
      ></a-layout-sider>
      <a-layout-content
        ><div class="body">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :key="$route.name" :is="Component" v-if="$route.meta.keepAlive" />
            </keep-alive>
            <component :key="$route.name" :is="Component" v-if="!$route.meta.keepAlive" />
          </router-view></div
      ></a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import logo from './assets/icon.png'
import { useDownloadTaskStore } from './store/downloadTask'
import { Notification } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
const route = useRoute()
watch(
  () => route.path,
  () => {
    if (route.name === 'Home') {
      window.dispatchEvent(new Event('resize'))
    }
  }
)
const downloadTaskStore = useDownloadTaskStore()
window.electron.ipcRenderer.on('update-file-progress', (_, { fid, progress, status }) => {
  downloadTaskStore.updateProcess(fid, progress, status)
})
window.electron.ipcRenderer.on('notification', (_, notification) => {
  Notification[notification.type]({
    ...notification
  })
})
window.electron.ipcRenderer.on('task-add', (_, data) => {
  downloadTaskStore.addTask(data)
})
const closeAPP = () => {
  window.electron.ipcRenderer.send('close-app')
}
const minisizeAPP = () => {
  window.electron.ipcRenderer.send('minimize-app')
}
const fullscreenAPP = () => {
  window.electron.ipcRenderer.send('fullscreen-app')
}
</script>

<style scoped>
.header {
  height: 40px;
  width: 100%;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  z-index: 1000000;
  -webkit-app-region: drag;
}
.btn {
  -webkit-app-region: no-drag;
}
.logo {
  z-index: 1001;
  display: flex;
  align-items: center;
}
.logo p {
  font-size: 12px;
  margin-left: 8px;
}
.body {
  margin-top: 40px;
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  overflow: hidden;
}
.menu {
  position: fixed;
  width: 260px;
}
</style>
