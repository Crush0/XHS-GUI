<template>
  <div class="my">
    <div class="avatar-wapper">
      <a-avatar :style="{ backgroundColor: '#3370ff' }">
        <img
          v-if="userStore.getProfile.images !== ''"
          :src="userStore.getProfile.images"
          style="border-radius: 50%"
          alt="avatar"
        />
        <IconUser style="width: 100%" v-else />
      </a-avatar>
    </div>
    <div class="info-warpper" v-if="userStore.getProfile.nickname !== ''">
      <div class="name">{{ userStore.getProfile.nickname }}</div>
      <div class="uid">{{ userStore.getProfile.unqiueId }}</div>
    </div>
    <div class="info-warpper" v-else>
      <div class="uid">请先登录</div>
    </div>
    <div class="btn-warpper">
      <a-tooltip content="登录">
        <a-button shape="circle" size="mini" @click="loginAction">
          <icon-edit />
        </a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@renderer/store/user'
import { Notification } from '@arco-design/web-vue'
const userStore = useUserStore()
userStore.fetchUserProfile().catch(() => {
  Notification.error({
    title: '错误',
    content: '未登录或登陆失效',
    style: {
      marginTop: '40px'
    }
  })
})
const loginAction = () => {
  window.electron.ipcRenderer.once('login-result', (_event, cookies) => {
    userStore.setCookie(cookies)
    userStore.fetchUserProfile()
  })
  window.electron.ipcRenderer.send('login-show')
}
</script>

<style scoped>
.my {
  width: 160px;
  border-radius: 80px;
  display: flex;
  background-color: #d8d8d8;
  align-items: center;
  position: relative;
}
.info-warpper {
  margin-left: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.name {
  font-size: 14px;
  font-weight: bold;
  color: black;
}
.uid {
  font-size: 12px;
  color: gray;
}
.btn-warpper {
  margin-right: 4px;
  position: absolute;
  right: 6px;
}
.qrcode-warpper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qrcode-text {
  font-size: 14px;
  color: gray;
  text-align: center;
}
</style>
