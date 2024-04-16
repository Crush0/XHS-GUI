<template>
  <div class="dm-container">
    <div class="title">
      <h2>下载列表</h2>
    </div>
    <a-divider></a-divider>
    <a-tabs default-active-key="downloading" v-model:active-key="activeKey" :animation="true">
      <template #extra>
        <a-space>
          <a-button
            type="primary"
            status="success"
            :disabled="activeKey === 'finished'"
            @click="startAll"
            >开始全部</a-button
          >
          <a-button
            type="primary"
            :disabled="!(activeKey !== 'finished' && activeKey !== 'paused')"
            @click="pauseAll"
            >暂停全部</a-button
          >
          <a-button type="outline" status="danger" @click="removeListedTasks">清空列表</a-button>
        </a-space>
      </template>
      <a-tab-pane key="downloading" :title="`下载中(${downloadTasks.length})`">
        <TaskList :tasks="downloadTasks" />
      </a-tab-pane>
      <a-tab-pane key="paused" :title="`等待中(${pausedTasks.length})`">
        <TaskList :tasks="pausedTasks" />
      </a-tab-pane>
      <a-tab-pane key="finished" :title="`已完成(${finishedTasks.length})`">
        <TaskList :tasks="finishedTasks" />
      </a-tab-pane>
      <a-tab-pane key="error" :title="`错误(${errorTasks.length})`">
        <TaskList :tasks="errorTasks" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useDownloadTaskStore } from '../store/downloadTask'
import { Status } from '../type.d'
import { Modal } from '@arco-design/web-vue'
const activeKey = ref('downloading')
const downloadTaskStore = useDownloadTaskStore()
const downloadTasks = computed(() => downloadTaskStore.getDownloadingTasks.reverse())
const pausedTasks = computed(() => downloadTaskStore.getPausedTasks)
const finishedTasks = computed(() => downloadTaskStore.getFinishedTasks)
const errorTasks = computed(() => downloadTaskStore.getErrorTasks)
const startAll = () => {
  pausedTasks.value.forEach((task) => {
    const { file: files } = task
    files.forEach((file) => {
      window.electron.ipcRenderer.send('task-status-update', {
        fileItemId: file.id,
        status: Status.PENDING
      })
    })
  })
}
const pauseAll = () => {
  downloadTasks.value.forEach((task) => {
    const { file: files } = task
    files.forEach((file) => {
      window.electron.ipcRenderer.send('task-status-update', {
        fileItemId: file.id,
        status: Status.PAUSED
      })
    })
  })
}
const removeListedTasks = async () => {
  let confirmed = true
  if (activeKey.value !== 'finished') {
    confirmed = await new Promise((resolve) => {
      Modal.warning({
        title: '存在下载中的文件',
        content: '你有一个或多个未下载完成的文件，确定要删除这些任务吗？',
        closable: false,
        okText: '确定',
        cancelText: '取消',
        hideCancel: false,
        width: 450,
        onOk: () => {
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        }
      })
    })
  }
  if (confirmed) {
    switch (activeKey.value) {
      case 'downloading':
        downloadTaskStore.clearDownloadingTasks()
        break
      case 'paused':
        downloadTaskStore.clearPausedTasks()
        break
      case 'finished':
        downloadTaskStore.clearFinishedTasks()
        break
    }
  }
}
</script>

<style scoped>
.dm-container {
  margin: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
