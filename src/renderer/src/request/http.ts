import { Notification } from '@arco-design/web-vue'
import axios from 'axios'
import { useUserStore } from '@renderer/store/user'
const http = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 60000,
  validateStatus(status) {
    return status >= 200 && status < 500
  }
})

http.interceptors.response.use((resp) => {
  if (resp.status !== 200) {
    Notification.error({
      title: '请求失败 ' + resp.status,
      content: resp.statusText,
      style: {
        marginTop: '40px'
      }
    })
    if (resp.status === 461 || resp.status === 471) {
      const userStore = useUserStore()
      window.electron.ipcRenderer.send(
        'open-url',
        userStore.getProfile.icookies,
        'https://www.xiaohongshu.com/web-login/captcha'
      )
    }
    return Promise.reject(resp)
  } else {
    return resp
  }
})

export function GET(url: string, params?: any) {
  return new Promise((resolve, reject) => {
    http
      .get(url, { params })
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export function strStream(url: string, data?: any, cb?: (chunk: any) => void) {
  return new Promise<void>(async (resolve, reject) => {
    const response = await fetch('http://localhost:5000/api/red' + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      reject('Network response was not ok')
    }
    const reader = response?.body?.getReader()
    const textDecoder = new TextDecoder()
    let result = true
    while (result) {
      const readResult = await reader?.read()
      if (readResult?.done) {
        resolve()
        result = false
        break
      }
      const chunkText = textDecoder.decode(readResult?.value)
      cb && cb(chunkText)
    }
  })
}

export function POST(url: string, data?: any) {
  return new Promise((resolve, reject) => {
    http
      .post(url, data)
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
