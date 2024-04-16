import axios from 'axios'
import { get_request_headers_params, generate_x_b3_traceid } from './utils/xhs_xs'
import { generateLocalId } from './utils'
import { get_request_headers_template } from '../utils/header'
import Crypto from 'node:crypto'
import store from '../../store'
const loginAxios = axios.create({
  baseURL: 'https://edith.xiaohongshu.com',
  withCredentials: true,
  withXSRFToken: false
})

function a1WebId() {
  let a1: any = store.get('a1')
  if (!a1) {
    a1 = generateLocalId()
    store.set('a1', a1)
  }
  let webId = store.get('webId')
  if (!webId) {
    webId = Crypto.createHash('md5').update(a1).digest('hex')
    store.set('webId', webId)
  }
  return (refresh: boolean) => {
    if (refresh) {
      a1 = generateLocalId()
      webId = Crypto.createHash('md5').update(a1).digest('hex')
      store.set('a1', a1)
      store.set('webId', webId)
    }
    return { a1, webId }
  }
}
const a1WebIdGenerator = a1WebId()
loginAxios.interceptors.request.use((config) => {
  const { a1, webId } = a1WebIdGenerator(false)
  const { url, data, params, method } = config
  const initCookieDict = {
    a1,
    webId
  }
  const initCookieStr = Object.entries(initCookieDict)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
  let api = url ?? ''
  if (method?.toLowerCase() === 'get') {
    for (let key in params) {
      api += `${api.includes('?') ? '&' : '?'}${key}=${params[key]}`
    }
  }
  const xsxt = get_request_headers_params(
    api,
    method?.toLowerCase() === 'get' ? '' : JSON.stringify(data, null, 0),
    a1,
    true
  )
  const headers = get_request_headers_template()
  headers['x-s'] = xsxt['xs']
  headers['x-t'] = xsxt['xt']
  headers['x-s-common'] = xsxt['xs_common']
  headers['x-b3-traceid'] = generate_x_b3_traceid(16)
  for (let key in headers) {
    config.headers.set(key, headers[key])
  }
  config.headers.set('Cookie', initCookieStr)
  return config
})

export const getLoginQR = async () => {
  const API = '/api/sns/web/v1/login/qrcode/create'
  return new Promise((resolve, reject) => {
    loginAxios
      .request({
        url: API,
        method: 'POST',
        data: { qr_type: '1' }
      })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        
        
        console.error('getLoginQR error')
        a1WebIdGenerator(true)
        reject(err)
      })
  })
}

export const checkLoginQRStatus = async (qrId: string, code: string) => {
  const API = '/api/sns/web/v1/login/qrcode/status'
  return new Promise((resolve, reject) => {
    loginAxios
      .get(API, {
        params: {
          qr_id: qrId,
          code
        }
      })
      .then((res) => {
        const { a1, webId } = a1WebIdGenerator(false)
        resolve({
          a1,
          webId,
          ...res.data
        })
      })
      .catch((err) => {
        a1WebIdGenerator(true)
        reject(err)
      })
  })
}
