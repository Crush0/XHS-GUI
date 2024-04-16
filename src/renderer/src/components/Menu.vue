<template>
  <div class="menu-wapper">
    <a-menu
      class="menu"
      :style="{ width: '100%', height: '100%' }"
      :default-selected-keys="['Home']"
      :selected-keys="[route.name]"
      @menu-item-click="handleClick"
    >
      <a-menu-item key="Home">首页</a-menu-item>
      <a-menu-item key="DownloadManager">
        <div class="dm-item">
          <p>下载管理</p>
          <a-badge :count="downloadTasks.values.length" />
        </div>
      </a-menu-item>
      <!-- <a-menu-item key="creator">创作者服务</a-menu-item> -->
      <a-menu-item key="Settings">设置</a-menu-item>

      <!-- <a-menu-item key="Help">帮助</a-menu-item> -->
      <a-menu-item key="About">关于</a-menu-item>
    </a-menu>
    <div class="my-wapper">
      <My></My>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useDownloadTaskStore } from '../store/downloadTask'
import { computed } from 'vue'
const downloadTaskStore = useDownloadTaskStore()
const downloadTasks = computed(() => downloadTaskStore.getDownloadingTasks)
const router = useRouter()
const route = useRoute()
const handleClick = (key: string) => {
  router.push({ name: key })
}
</script>

<style scoped>
.menu-wapper {
  width: 100%;
  height: calc(100vh - 40px);
  margin-top: 40px;
  display: flex;
  flex-direction: column;
}
.dm-item {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
}
.menu {
  flex: 6;
}
.my-wapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
