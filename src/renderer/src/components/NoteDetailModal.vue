<template>
  <a-modal v-model:visible="visiable" :closable="false" :footer="false">
    <div class="note-detail-warpper">
      <a-row class="grid-row">
        <a-col :span="18" style="height: 100%">
          <a-carousel v-if="noteFeed.type !== 'video'" style="width: 100%; height: 100%">
            <a-carousel-item v-for="image in noteFeed.image_list">
              <img
                :src="image.url_default"
                :style="{
                  height: 'full',
                  width: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: '8px'
                }"
              /> </a-carousel-item
          ></a-carousel>
          <video v-if="noteFeed.type === 'video'" :src="noteFeed.video_url" controls></video>
        </a-col>
        <a-col :span="6">
          <div>24 - 100%</div>
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { Notification } from '@arco-design/web-vue'
import { ref } from 'vue'
import Request from '../request'
const props = defineProps(['note'])
const noteFeed = ref({} as any)
const visiable = ref(false)
const getNoteFeed = () => {
  return new Promise<void>((resolve, reject) => {
    Request.RED.getFeed(props.note.note_id)
      .then((res) => {
        const { items } = res
        const item = items[0]
        const { note_card } = item
        noteFeed.value = note_card
        console.log(noteFeed.value)

        resolve()
      })
      .catch((err) => {
        reject(err)
      })
  })
}
const showDetailModal = () => {
  getNoteFeed()
    .then(() => {
      visiable.value = true
    })
    .catch(() => {
      Notification.error({
        title: '出错啦！',
        content: '获取笔记详情失败，请稍后重试',
        style: {
          marginTop: '40px'
        }
      })
    })
}
defineExpose({ showDetailModal })
</script>

<style scoped>
.note-detail-warpper {
  width: 100%;
  height: 480px;
}
.grid-row {
  height: 100%;
}
</style>
