<template>
  <a-modal
    width="300px"
    :visible="visible"
    ok-text="取消下载"
    cancel-text="后台下载"
    :closable="false"
    :mask-closable="false"
    draggable
    @ok="cancelDownload"
    @cancel="backDownload"
  >
    <template #title> 新版本下载中 </template>
    <div class="progress-warpper">
      <a-progress
        size="large"
        type="circle"
        :percent="Number.parseFloat((percent / 100.0).toFixed(2))"
        :status="status"
      />
      <div class="progress-info">
        <p>{{ (bytesPerSecond / 1e6).toFixed(2) }}Mb/s</p>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { Modal } from '@arco-design/web-vue'
import { ref } from 'vue'

window.electron.ipcRenderer.on('update-available', (_event, info) => {
  const { version } = info
  const modal = Modal.info({
    title: '有可用更新',
    content: `新版本 ${version} 可用，是否立即更新？`,
    okText: '立即更新',
    draggable: true,
    maskClosable: false,
    hideCancel: false,
    cancelText: '稍后提醒',
    onOk: () => {
      window.electron.ipcRenderer.send('download-update')
    },
    onCancel: () => {
      modal.close()
    }
  })
})
const status = ref(undefined as any)
const percent = ref(0)
const visible = ref(false)
const bytesPerSecond = ref(0)
const isBackDownload = ref(false)
const backDownload = () => {
  visible.value = false
  isBackDownload.value = true
}
const cancelDownload = () => {
  visible.value = false
  window.electron.ipcRenderer.send('cancel-download')
}
window.electron.ipcRenderer.on('update-downloaded', () => {
  status.value = 'success'
  const modal = Modal.info({
    title: '更新已下载',
    content: '更新已下载，是否立即安装更新？',
    draggable: true,
    maskClosable: false,
    okText: '立即安装',
    cancelText: '稍后安装',
    hideCancel: false,
    onOk: () => {
      window.electron.ipcRenderer.send('install-update')
    },
    onCancel: () => {
      modal.close()
    }
  })
})

window.electron.ipcRenderer.on('update-download-progress', (_event, info) => {
  if (!visible.value && !isBackDownload.value) {
    visible.value = true
  }
  const { percent: p, bytesPerSecond: b } = info
  percent.value = p
  bytesPerSecond.value = b
})
</script>

<style scoped>
.progress-warpper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.progress-info {
  margin-top: 10px;
  color: #666;
  user-select: none;
  font-size: 14px;
}
</style>
