import { defineStore } from 'pinia'
import { DownloadTask, Status } from '../type.d'
import { IFileItem } from '../type.d'
export const useDownloadTaskStore = defineStore('downloadTask', {
  state: () => ({
    downloadTasks: [] as DownloadTask[]
  }),
  persist: true,
  getters: {
    getFinishedTasksCount(_state) {
      return (task: DownloadTask): number => {
        return task.file.filter((file) => file.status === Status.FINISHED).length
      }
    },
    getDownloadingTasks(state) {
      return state.downloadTasks
        .filter((task) =>
          task.file.some(
            (file) =>
              file.status === Status.DOWNLOADING ||
              file.status === Status.PENDING ||
              file.status === Status.PAUSED
          )
        )
        .reverse()
    },
    getPausedTasks(state) {
      return state.downloadTasks
        .filter((task) => task.file.some((file) => file.status === Status.PAUSED))
        .reverse()
    },
    getErrorTasks(state) {
      return state.downloadTasks
        .filter((task) => task.file.some((file) => file.status === Status.ERROR))
        .reverse()
    },
    getALLFiles(state): Array<IFileItem> {
      return state.downloadTasks.flatMap((task) => task.file)
    },
    getFinishedTasks(state) {
      return state.downloadTasks
        .filter((task) => task.file.every((file) => file.status === Status.FINISHED))
        .reverse()
    }
  },
  actions: {
    clearDownloadingTasks() {
      this.getDownloadingTasks.forEach((task) => {
        task.file.forEach((f) => {
          window.electron.ipcRenderer.send('task-status-update', {
            fileItemId: f.id,
            status: Status.CANCELED
          })
        })
        this.removeTask(task)
      })
    },
    clearPausedTasks() {
      this.getPausedTasks.forEach((task) => {
        task.file.forEach((f) => {
          window.electron.ipcRenderer.send('task-status-update', {
            fileItemId: f.id,
            status: Status.CANCELED
          })
        })
        this.removeTask(task)
      })
    },
    clearFinishedTasks() {
      this.getFinishedTasks.forEach((task) => {
        this.removeTask(task)
      })
    },
    removeTask(task: DownloadTask) {
      return new Promise((resolve) => {
        this.downloadTasks = this.downloadTasks.filter((t) => t.id !== task.id)
        resolve(true)
      })
    },
    removeFile(taskId: string, file: IFileItem) {
      return new Promise((resolve) => {
        const task = this.downloadTasks.find((t) => t.id === taskId)
        if (task) {
          task.file = task.file.filter((f) => f.id !== file.id)
          if (task.file.length === 0) {
            this.removeTask(task)
          }
        }
        resolve(true)
      })
    },
    updateProcess(fileId: string, progress: number, status: Status) {
      new Promise((resolve) => {
        const file = this.getALLFiles.find((f) => f.id === fileId)
        if (file) {
          file.progress = progress === -1 ? file.progress : progress
          file.status = file.progress === 100 ? Status.FINISHED : file.status
          if (status != Status.None) {
            file.status = status
          }
        } else {
          console.warn('file not found', fileId)
        }
        resolve(true)
      })
    },
    addTask(task: DownloadTask) {
      return new Promise((resolve) => {
        this.downloadTasks.push(task)
        resolve(true)
      })
    }
  }
})
