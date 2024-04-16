<template>
  <div class="task-list">
    <a-collapse class="task-list-collapse" v-if="tasks.length > 0">
      <a-collapse-item v-for="task in tasks" :key="task.rid">
        <template #header>
          <div class="task-list-item-header">
            <div class="user-avatar-wapper">
              <a-avatar :size="40">
                <img :src="task.user.avatar" alt="avatar" />
              </a-avatar>
            </div>
            <div class="note-info">
              <div class="nickname">
                {{ task.user.nickname }}
              </div>
              <div class="note-title">
                {{ task.title }}
              </div>
            </div>
          </div>
        </template>
        <template #extra>
          <div class="extra">
            <div class="extra-btn">
              <a-space>
                <a-button size="mini" shape="circle" @click.stop="openFolder(task)">
                  <template #icon>
                    <icon-folder />
                  </template>
                </a-button>
                <a-button size="mini" shape="circle" @click.stop="handleDelete(task)">
                  <template #icon>
                    <icon-delete />
                  </template>
                </a-button>
              </a-space>
            </div>
            <div class="download-progress">
              {{ downloadTaskStore.getFinishedTasksCount(task) }}/{{ task.file.length }}
            </div>
          </div>
        </template>
        <div v-for="f in task.file">
          <file-list-item :key="f.id" :file="f" :taskId="task.id" />
        </div>
      </a-collapse-item>
    </a-collapse>
    <a-empty v-else />
  </div>
</template>

<script lang="ts" setup>
import { Modal } from '@arco-design/web-vue'
import { useDownloadTaskStore } from '../store/downloadTask'
import { DownloadTask, Status } from '../type.d'
const downloadTaskStore = useDownloadTaskStore()
defineProps({
  tasks: {
    type: Array as () => DownloadTask[],
    required: true
  }
})
const handleDelete = (task: DownloadTask) => {
  new Promise<boolean>((resolve) => {
    if (
      task.file.some(
        (f) =>
          f.status === Status.DOWNLOADING ||
          f.status === Status.PAUSED ||
          f.status === Status.PENDING
      )
    ) {
      Modal.warning({
        title: '存在下载中的文件',
        content: '你有一个或多个未下载完成的文件，确定要删除该任务吗？',
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
    } else {
      resolve(true)
    }
  }).then((confirm) => {
    if (confirm) {
      task.file.forEach((f) => {
        if (f.status != Status.FINISHED) {
          window.electron.ipcRenderer.send('task-status-update', {
            fileItemId: f.id,
            status: Status.CANCELED
          })
        }
      })
      downloadTaskStore.removeTask(task)
    }
  })
}
const openFolder = (task: DownloadTask) => {
  window.electron.ipcRenderer.send('open-folder', task.path)
}
</script>

<style scoped>
.task-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.task-list-collapse {
  width: 100%;
}
.task-list-item-header {
  display: flex;
  align-items: center;
}
.user-avatar-wapper {
  margin-right: 10px;
  flex: 1;
}
.nickname {
  font-size: 18px;
  font-weight: 400;
  color: #333;
}
.note-title {
  font-size: 12px;
  color: #666;
}
.download-progress {
  flex: 1;
}
</style>
