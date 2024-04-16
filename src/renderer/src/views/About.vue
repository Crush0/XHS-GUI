<template>
  <div class="about">
    <div class="about-card">
      <a-space direction="vertical">
        <a-avatar :size="128">XHS-GUI</a-avatar>
        <div class="version">Version: {{ version }}</div>
      </a-space>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useSettingStore } from '../store/settings';
import { ref } from 'vue'
const settingStore = useSettingStore()
const version = ref(settingStore.getSettings.version)
</script>
<style scoped>
.about {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
.about-card {
  margin-top: 50px;
  width: 500px;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 12px;
  box-shadow: 0 0 10px #ccc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.version {
  text-align: center;
  font-size: 12px;
  color: #666;
}
</style>
