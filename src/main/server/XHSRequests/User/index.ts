import http from '../http'
import jsdom from 'jsdom'
import { getCookies } from '../utils/cookie'
import { genRandomString } from '../utils'
import { get_request_headers_params } from '../utils/xhs_xs'
const BASE_URL = 'https://edith.xiaohongshu.com'
const USER_INFO_URL = (userID: string) => {
  return `https://www.xiaohongshu.com/user/profile/${userID}`
}

export const getMeProfile = async (): Promise<object | undefined> => {
  const cookie = getCookies()
  const api = '/api/sns/web/v2/user/me'
  const xsxt = get_request_headers_params(api, '', cookie[0]['a1'])
  const resp = await http.get(BASE_URL + api, {
    headers: {
      'x-s': xsxt['xs'],
      'x-t': xsxt['xt'],
      'x-s-common': xsxt['xs_common'],
      'Cookie': cookie[1] as string
    }
  })
  const { success, data } = resp.data
  if (success) {
    return data
  }
  return Promise.reject(new Error('获取个人信息失败'))
}
export const getUserInfoByRedId = async (redId: string): Promise<any | undefined> => {
  const api = '/api/sns/web/v1/search/onebox'
  const cookie = getCookies()
  const data = {
    biz_type: 'web_search_user',
    keyword: redId,
    search_id: genRandomString(21),
    request_id: `${Math.floor(Math.random() * 1e10)}-${+new Date()}`
  }
  const xsxt = get_request_headers_params(api, data, cookie[0]['a1'])
  const resp = await http.post(BASE_URL + api, data, {
    headers: {
      'x-s': xsxt['xs'],
      'x-t': xsxt['xt'],
      'x-s-common': xsxt['xs_common']
    }
  })
  const { success, data: data_ } = resp.data
  if (success) {
    return data_
  }
  return undefined
}

export const getUserInfo = async (userID: string): Promise<User | undefined> => {
  const { JSDOM } = jsdom
  const url = USER_INFO_URL(userID)
  const resp = await http.get(url)
  if (resp.status === 200) {
    const dom = new JSDOM()
    const parser = new dom.window.DOMParser()
    const doc = parser.parseFromString(resp.data, 'text/html')
    const userName = doc.querySelector('.user-name')?.textContent
    const unqiueId = doc.querySelector('.user-redId')?.textContent?.split('：')[1]
    const userIP = doc.querySelector('.user-IP')?.textContent?.split('：')[1]
    const userDesc = doc.querySelector('.user-desc')?.textContent
    const userAvatar = doc
      .querySelector('#userPageContainer > div.user > div > div:nth-child(1) > div > img')
      ?.getAttribute('src')
    const userTags: string[] = []
    const userTagElements = doc.querySelector('.user-tags')?.children
    if (userTagElements) {
      for (let tag of userTagElements) {
        tag.textContent && userTags.push(tag.textContent)
      }
    }
    const userInteractions = {
      follow: doc.querySelector(
        '#userPageContainer > div.user > div > div.info-part > div.info > div.data-info > div > div:nth-child(1) > span.count'
      )?.textContent,
      fans: doc.querySelector(
        '#userPageContainer > div.user > div > div.info-part > div.info > div.data-info > div > div:nth-child(2) > span.count'
      )?.textContent,
      likes: doc.querySelector(
        '#userPageContainer > div.user > div > div.info-part > div.info > div.data-info > div > div:nth-child(3) > span.count'
      )?.textContent
    }

    return {
      userName,
      unqiueId,
      userIP,
      userDesc,
      userAvatar,
      userTags,
      userInteractions
    }
  }
  return undefined
}
