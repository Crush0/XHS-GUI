<template>
  <div v-menu.right="menus" class="note-card">
    <NoteDetailModal :note="note" ref="detailModal" />
    <a-checkbox
      style="position: absolute; top: 10px; right: 20px; z-index: 10"
      :model-value="note.isSelected"
    ></a-checkbox>
    <div class="img">
      <img
        :width="210"
        style="object-fit: cover; min-height: 300px"
        :src="note.cover.url_default"
        alt="cover"
      />
      <div class="cover"></div>
      <icon-play-circle
        v-if="note.type === 'video'"
        style="
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 10;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
        "
      />
      <div class="desc">
        <div class="text">
          {{ note.display_title }}
        </div>
        <div class="like">❤ {{ note.interact_info.liked_count }}</div>
        <div class="author">
          <a-avatar :size="18">
            <img style="border-radius: 50%" :src="note.user.avatar" alt="" />
          </a-avatar>
          <p style="margin-left: 5px">{{ note.user.nickname }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Request from '../request'
import { useUserStore } from '../store/user'
import { ref, shallowRef } from 'vue'
import { directive } from 'vue3-menus'
import { Notification } from '@arco-design/web-vue'
import { useSettingStore } from '@renderer/store/settings'
const props = defineProps(['note'])
const vMenu = directive
const userStore = useUserStore()
const settingStore = useSettingStore()
const detailModal = ref(null as any)
const menus = shallowRef({
  minWidth: 120,
  menus: [
    // {
    //   label: '显示详细',
    //   click: () => {
    //     detailModal.value.showDetailModal()
    //   }
    // },
    {
      label: '立即下载',
      click: () => {
        downloadSelectedNotes()
      }
    }
  ]
})

const downloadSelectedNotes = () => {
  new Promise(() => {
    if (userStore.getProfile.icookies === '') {
      Notification.error({
        title: '错误',
        content: '请先设置Cookie！',
        style: {
          marginTop: '40px'
        }
      })
    }
    const selectedNotes = [props.note]
    Request.RED.downloadNotes(selectedNotes, settingStore.getSettings.downloadComment).then((_resp) => {
      Notification.success({
        title: '成功',
        content: '已加入下载队列！',
        style: {
          marginTop: '40px'
        }
      })
    })
  })
}
</script>

<style scoped>
.note-card {
  user-select: none;
  width: 240px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.note-card img {
  border-radius: 8px;
}
.text {
  width: 100%;
  word-break: break-all;
  overflow: hidden;
  font-weight: 500;
  font-size: 14px;
  flex: 5;
}
.author {
  display: flex;
  align-items: center;
  margin-top: 5px;
}
.desc {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100px;
  bottom: 3px;
  /* transform: translateY(65px); */
  width: 100%;
  color: #fff;
  border-radius: 8px;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease-in-out;
}
.cover {
  transition: all 0.3s ease-in-out;
  border-radius: 8px;
  cursor: pointer;
}
.img {
  position: relative;
  overflow: hidden;
}
.note-card:hover .desc {
  transform: translateY(0);
}
.note-card:hover .cover {
  background-color: rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 99%;
  z-index: 1;
}
</style>
