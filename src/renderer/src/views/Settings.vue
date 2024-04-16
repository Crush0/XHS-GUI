<template>
  <div class="setting-container">
    <div class="title">
      <h2>系统设置</h2>
    </div>
    <a-divider></a-divider>
    <div class="form-warpper">
      <a-form :model="settingForm" :style="{ width: '600px' }">
        <a-form-item field="downloadPath" tooltip="选择文件下载目录" label="下载目录">
          <a-input-search
            v-model="settingForm.downloadPath"
            placeholder="选择文件下载目录"
            search-button
            :button-props="{
              // @ts-ignore
              onClick: onSelectDirBtnClick
            }"
          >
            <template #button-icon>
              <icon-folder />
            </template>
          </a-input-search>
        </a-form-item>
        <a-form-item
          field="downloadComment"
          tooltip="是否下载评论"
          label="下载评论(暂未实现)"
          disabled
        >
          <a-switch v-model="settingForm.downloadComment"></a-switch>
        </a-form-item>
        <a-form-item
          field="downloadProxy"
          tooltip="启用下载代理（重启应用后生效）"
          label="开启代理"
        >
          <a-switch v-model="settingForm.downloadPorxy.enable"></a-switch>
          <a-divider v-if="settingForm.downloadPorxy.enable" direction="vertical" />
          <a-input
            v-if="settingForm.downloadPorxy.enable"
            v-model="settingForm.downloadPorxy.url"
          />
        </a-form-item>
        <a-form-item field="downloadThread" tooltip="下载线程数" label="下载线程数">
          <a-input-number v-model="settingForm.downloadThread" :min="1" :max="10" mode="button" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="saveSettings">保存</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingStore } from '../store/settings'
import { Notification } from '@arco-design/web-vue'
const settings = useSettingStore()
const settingForm = ref(settings.getSettings)
const onSelectDirBtnClick = () => {
  const resultPath = window.electron.ipcRenderer.sendSync(
    'setSavePath',
    '选择下载路径',
    settingForm.value.downloadPath
  )
  if (resultPath && resultPath.length > 0) {
    const newDownloadPath = resultPath[0]
    settingForm.value.downloadPath = newDownloadPath
  }
}
const saveSettings = () => {
  settings.setSetting(settingForm.value)
  window.electron.ipcRenderer.send(
    'save-settings',
    JSON.stringify({
      downloadPath: settingForm.value.downloadPath,
      downloadThread: settingForm.value.downloadThread,
      downloadPorxy: {
        enable: settingForm.value.downloadPorxy.enable,
        url: settingForm.value.downloadPorxy.url
      },
      downloadComment: settingForm.value.downloadComment
    })
  )
  Notification.success({
    title: '保存成功',
    content: '设置已保存',
    style: {
      marginTop: '40px'
    }
  })
}
</script>

<style scoped>
.setting-container {
  margin: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.form-warpper {
  margin: 0 auto;
  width: 1000px;
}
</style>
