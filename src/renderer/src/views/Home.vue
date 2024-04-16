<template>
  <div class="home-page" ref="homeRef">
    <a-input-group>
      <a-select
        :options="searchOptions"
        v-model:model-value="searchType"
        :style="{
          width: '140px',
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px'
        }"
        placeholder="选择搜索类别"
      />
      <a-input
        :style="{
          width: '420px'
        }"
        v-model:model-value="searchValue"
        @press-enter="fetchPosts"
        placeholder="输入搜索内容"
        allow-clear
      />
      <a-button
        :style="{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }"
        type="primary"
        @click="fetchPosts"
        >搜索</a-button
      >
    </a-input-group>
    <div class="user" v-show="userProfile.userName">
      <div class="user-info">
        <div class="avatar">
          <a-avatar :size="120">
            <img :src="userProfile.userAvatar" alt="avatar" />
          </a-avatar>
        </div>
        <div class="info-part">
          <div class="info">
            <div class="user-basic">
              <div class="name">{{ userProfile.userName }}</div>
              <div class="user-content">
                <span class="user-redId"> 小红书号：{{ userProfile.unqiueId }} </span>
                <span class="user-IP"> IP属地：{{ userProfile.userIP }} </span>
              </div>
            </div>
            <div class="user-desc">
              {{ userProfile.userDesc }}
            </div>
            <div class="user-tags">
              <a-tag v-for="(tag, index) in userProfile.userTags" :key="index">{{ tag }}</a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a-divider />
    <div class="tools">
      <div class="btn-group">
        <a-space>
          <a-button type="primary" @click="selectAllPicNotes">全选图片笔记</a-button>
          <a-button type="primary" @click="selectAllVideoNotes">全选视频笔记</a-button>
          <!-- 全选 -->
          <a-button type="primary" @click="selectAllNotes">全选</a-button>
          <!-- 反选 -->
          <a-button type="outline" @click="deselectAllNotes">反选</a-button>
          <!-- 下载选中 -->
          <a-button type="primary" tatus="success" @click="downloadSelectedNotes"
            >下载选中</a-button
          >
        </a-space>
      </div>
    </div>
    <a-divider />
    <div class="note-lists" ref="noteCardRef" v-if="noteCardList.length > 0" v-masonry :gutter="10">
      <note-card
        v-masonry-tile
        v-for="(item, index) in noteCardList"
        :key="index"
        :note="item"
        @click="
          () => {
            item.isSelected = !item.isSelected
          }
        "
      />
    </div>
    <div v-else>
      <a-empty> 这里是没有笔记的荒原 </a-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useScroll } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/shared'
import Request from '../request'
import { useUserStore } from '@renderer/store/user'
import { Notification } from '@arco-design/web-vue'
import { useSettingStore } from '@renderer/store/settings'
const settingStore = useSettingStore()
const noteCardList = ref([] as any[])
const userProfile = ref({} as any)
const userStore = useUserStore()
const noteCardRef: any = ref(null)
const homeRef = ref<HTMLElement | null>(null)
const postFetchFlag = ref(false)
const searchValue = ref('')
const { arrivedState } = useScroll(homeRef, {
  offset: {
    bottom: 400
  }
})
const searchOptions = [
  {
    label: '用户ID',
    value: 'userID'
  },
  {
    label: '小红书ID/昵称',
    value: 'userRedID'
  },
  {
    label: '全部',
    value: 'all'
  }
]
const searchType = ref('userRedID')
const pageNum = ref(1)
const fetchPosts = () => {
  if (searchValue.value === '') {
    Notification.info({
      title: '提示',
      content: '搜索内容不能为空！',
      style: {
        marginTop: '40px'
      }
    })
    return
  }
  postFetchFlag.value = false
  if (searchType.value === 'userID') {
    getUserInfo(searchValue.value)
  } else if (searchType.value === 'userRedID') {
    Request.RED.getUserInfoByRedId(searchValue.value).then((data) => {
      const { onebox_list } = data
      if (!onebox_list) {
        Notification.error({
          title: '错误',
          content: '用户不存在！',
          style: {
            marginTop: '40px'
          }
        })
        return
      }
      const { type, user_one_box } = onebox_list[0]
      if (type === 'user') {
        getUserInfo(user_one_box.id)
      }
    })
  } else {
    postFetchFlag.value = true
    noteCardList.value = []
    userProfile.value = {}
    searchPosts(searchValue.value)
  }
}
const searchPosts = (() => {
  let key = ''
  return (keyword: string | undefined = undefined) => {
    if (keyword) {
      key = keyword
    }
    Request.RED.searchPosts(key, pageNum.value).then((data) => {
      const { has_more, items } = data
      if (!has_more) {
        postFetchFlag.value = false
      }
      if (!items) {
        Notification.info({
          title: '提示',
          content: '没有更多了！',
          style: {
            marginTop: '40px'
          }
        })
        return
      }
      items.forEach((item) => {
        if (item.model_type === 'note') {
          noteCardList.value.push({
            ...item.note_card,
            isSelected: false,
            note_id: item.id
          })
        }
      })
      pageNum.value += 1
    })
  }
})()
const getUserInfo = useDebounceFn((value: string) => {
  noteCardList.value = []
  userProfile.value = {}
  if (value !== '') {
    Request.RED.getUserInfo(value).then((userInfo) => {
      userProfile.value = userInfo
    })
    Request.RED.getPosts(value)
  }
}, 500)
window.electron.ipcRenderer.on('fetch-posts', (_event, data) => {
  const { flag: _flag, notes } = data
  noteCardList.value.push(...notes)
})
const selectAllNotes = () => {
  noteCardList.value.forEach((item) => {
    item.isSelected = true
  })
}
const deselectAllNotes = () => {
  noteCardList.value.forEach((item) => {
    item.isSelected = !item.isSelected
  })
}
const selectAllPicNotes = () => {
  noteCardList.value.forEach((item) => {
    if (item.type === 'normal') {
      item.isSelected = true
    } else {
      item.isSelected = false
    }
  })
}
const selectAllVideoNotes = () => {
  noteCardList.value.forEach((item) => {
    if (item.type === 'video') {
      item.isSelected = true
    } else {
      item.isSelected = false
    }
  })
}
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
    const selectedNotes = noteCardList.value.filter((item) => item.isSelected)
    if (selectedNotes.length === 0) {
      Notification.info({
        title: '提示',
        content: '请先选择笔记！',
        style: {
          marginTop: '40px'
        }
      })
      return
    }
    Request.RED.downloadNotes(selectedNotes, settingStore.getSettings.downloadComment).then(
      (_resp) => {
        Notification.success({
          title: '成功',
          content: '已加入下载队列！',
          style: {
            marginTop: '40px'
          }
        })
      }
    )
  })
}

watch(
  () => arrivedState.bottom,
  (newVal) => {
    if (newVal && postFetchFlag.value) {
      searchPosts()
    }
  }
)
</script>

<style scoped>
.home-page {
  width: 100%;
  display: flex;
  height: calc(100vh - 40px);
  justify-content: flex-start;
  overflow: scroll;
  align-items: center;
  padding: 10px 0;
  flex-direction: column;
}
.user {
  width: 450px;
  margin: 10px;
  padding: 5px;
  display: flex;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.tools {
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
}
.user-info {
  display: flex;
  width: 100%;
}
.name {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 600;
}
.user-desc {
  width: 100%;
  font-size: 14px;
  line-height: 140%;
  color: #333;
  margin-top: 16px;
  white-space: pre-line;
}
.user-content {
  width: 100%;
  font-size: 12px;
  line-height: 120%;
  color: rgba(51, 51, 51, 0.6);
  display: flex;
  margin-top: 8px;
}
.user-tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}
.user-redId {
  padding-right: 12px;
}
.user .avatar {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.note-lists {
  width: 1280px;
}
.btn-group {
  margin: 0 10px;
}
</style>
