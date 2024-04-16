<template>
  <div class="file-item">
    <div class="file-item-header">
      <div class="info">
        <div class="name">
          {{ file.name }}
        </div>
        <div class="status">
          <a-tag :color="StatusInfo[file.status].color">{{ StatusInfo[file.status].text }}</a-tag>
        </div>
      </div>
      <div
        class="downloadBtn"
        v-if="file.status !== Status.FINISHED && file.status !== Status.ERROR"
      >
        <a-space>
          <a-button size="mini" shape="circle" @click="handleDownload(file)">
            <template #icon>
              <icon-pause
                v-if="file.status === Status.DOWNLOADING || file.status === Status.PENDING"
              />
              <icon-download v-else-if="file.status === Status.PAUSED" />
            </template>
          </a-button>
          <a-button size="mini" shape="circle" @click.stop="handleDelete(file)">
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
        </a-space>
      </div>
      <div v-else>
        <a-button
          size="mini"
          shape="circle"
          @click.stop="handleOpen(file)"
          v-if="file.status === Status.FINISHED"
        >
          <template #icon>
            <icon-launch />
          </template>
        </a-button>
      </div>
    </div>
    <a-progress
      :percent="
        Number.parseFloat(
          (file.progress / 100).toFixed(2) === 'NaN' ? '0' : (file.progress / 100).toFixed(2)
        )
      "
      :style="{ width: '100%' }"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { IFileItem, Status } from '../type.d'
import { useDownloadTaskStore } from '../store/downloadTask'
const downloadTaskStore = useDownloadTaskStore()
const StatusInfo = {
  [Status.PENDING]: {
    color: 'gold',
    text: '等待中'
  },
  [Status.DOWNLOADING]: {
    color: 'blue',
    text: '下载中'
  },
  [Status.PAUSED]: {
    color: 'cyan',
    text: '已暂停'
  },
  [Status.FINISHED]: {
    color: 'green',
    text: '已完成'
  },
  [Status.CANCELED]: {
    color: 'gray',
    text: '已取消'
  },
  [Status.ERROR]: {
    color: 'red',
    text: '错误'
  }
}
const props = defineProps({
  taskId: {
    type: String as PropType<string>,
    required: true
  },
  file: {
    type: Object as PropType<IFileItem>,
    required: true
  }
})
const handleDownload = (file: IFileItem) => {
  let status = file.status
  if (file.status === Status.PAUSED) {
    status = Status.PENDING
  } else if (file.status === Status.PENDING || file.status === Status.DOWNLOADING) {
    status = Status.PAUSED
  }
  window.electron.ipcRenderer.send('task-status-update', {
    fileItemId: file.id,
    status: status
  })
}
const handleDelete = (file: IFileItem) => {
  if (file.status !== Status.FINISHED) {
    window.electron.ipcRenderer.send('task-status-update', {
      fileItemId: file.id,
      status: Status.CANCELED
    })
  }
  downloadTaskStore.removeFile(props.taskId, props.file)
}

const handleOpen = (file: IFileItem) => {
  window.electron.ipcRenderer.send('open-file', {
    path: file.path,
    name: file.name
  })
}
</script>

<style scoped>
.file-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.downloadBtn {
  display: flex;
  align-items: center;
  margin-left: 4px;
}
.file-item {
  border: 1px solid #e8e8e8;
  background-color: #fff;
  margin: 10px;
  padding: 5px 10px;
  border-radius: 5px;
}
.file-item:hover {
  background-color: #f5f5f5;
}
.info {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
</style>
