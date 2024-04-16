import axios from 'axios'
import { getCookies } from './utils/cookie'
import { get_request_headers_template } from '../utils/header'
import logger from '../../logger'

const http = axios.create({
  withCredentials: true,
  headers: get_request_headers_template(),
  validateStatus(status) {
    return status >= 200 && status < 500
  }
})

http.interceptors.request.use((config) => {
  config.headers.Cookie = (getCookies()[1] as string).trim() ?? ''
  return config
})

http.interceptors.response.use(
  (response) => {
    // 打印日志
    logger.info(`XHSRequest [${response.config.method}] ${response.config.url} ${response.status}`)
    return response
  },
  (error) => {
    // 打印日志
    logger.error(
      `XHSRequest [${error.config.method}] ${error.config.url} ${error.response?.status} ${error.message}`
    )
    return Promise.reject(error)
  }
)

export default http
