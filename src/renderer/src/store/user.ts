import { defineStore } from 'pinia'
import Request from '../request'
import { IUser } from '../type.d'

export const useUserStore = defineStore('iuser', {
  state: (): IUser => ({
    images: '',
    userId: '',
    nickname: '',
    unqiueId: '',
    icookies: ''
  }),
  persist: true,
  getters: {
    getProfile: (state) => state
  },
  actions: {
    setCookie(cookies) {
      this.icookies = cookies
      this.$persist()
    },
    fetchUserProfile() {
      return new Promise((resolve, reject) => {
        if (this.icookies) {
          Request.RED.getMeProfile()
            .then((data) => {
              if (typeof data === 'string') {
                reject('no login err response')
              }
              this.images = data.images
              this.nickname = data.nickname
              this.userId = data.user_id
              this.unqiueId = data.red_id
              resolve(data)
            })
            .catch((err) => {
              reject(err)
            })
        } else {
          reject('no login no cookie')
        }
      })
    }
  }
})
