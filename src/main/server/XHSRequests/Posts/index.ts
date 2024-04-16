import { DownloadTask } from '../../type'
import http from '../http'
import { getCookies } from '../utils/cookie'
import { get_request_headers_params } from '../utils/xhs_xs'
import { genRandomString, mkdirsSync } from '../utils'
import fs from 'node:fs'
import aria2Download from '../../utils/aria2Download'
import { BrowserWindow } from 'electron'
import { getUserInfo } from '../User'
import path from 'node:path'
import logger from '../../../logger'
const POST_URL = 'https://edith.xiaohongshu.com'
export const getPosts = async (userId: string, cb: (flag, posts: any[], cause?: any) => void) => {
  const cookie = getCookies()
  const getPost = async (cursor: string) => {
    const api = `/api/sns/web/v1/user_posted?num=30&cursor=${cursor}&user_id=${userId}&image_formats=jpg,webp,avif`
    const xsxt = get_request_headers_params(api, '', cookie[0]['a1'])
    const resp = await http.get(POST_URL + api, {
      headers: {
        'x-s': xsxt['xs'],
        'x-t': xsxt['xt'],
        'x-s-common': xsxt['xs_common']
      }
    })
    const { success, data } = resp.data
    if (success && resp.status === 200) {
      return data
    } else {
      console.error('get posts failed')

      throw new Error(resp.statusText, {
        cause: resp
      })
    }
  }
  try {
    let currentCursor = ''
    const resp = await getPost(currentCursor)
    let { has_more, cursor, notes } = resp
    cb(!has_more, notes)
    while (has_more) {
      currentCursor = cursor
      let data = await getPost(currentCursor)
      if (data) {
        has_more = data.has_more
        cursor = data.cursor
        cb(!has_more, data.notes)
      }
    }
  } catch (error: any) {
    cb(true, [], error.cause)
  }
}

export const getFeed = async (noteId: string) => {
  const cookie = getCookies()
  const api = '/api/sns/web/v1/feed'
  const postData = {
    source_note_id: noteId,
    image_formats: ['jpg', 'webp', 'avif'],
    extra: { need_body_topic: '1' }
  }

  const xsxt = get_request_headers_params(api, postData, cookie[0]['a1'])
  const resp = await http.post(POST_URL + api, postData, {
    headers: {
      'x-s': xsxt['xs'],
      'x-t': xsxt['xt'],
      'x-s-common': xsxt['xs_common']
    }
  })

  const { success, data } = resp.data
  if (success) {
    return data
  } else {
    return null
  }
}

export const getSearchPosts = async (keyword: string, page) => {
  const api = '/api/sns/web/v1/search/notes'
  const postData = {
    ext_flags: [],
    image_formats: ['jpg', 'webp', 'avif'],
    keyword,
    note_type: 0,
    page,
    page_size: 20,
    search_id: genRandomString(21),
    sort: 'general'
  }
  const cookie = getCookies()
  const xsxt = get_request_headers_params(api, postData, cookie[0]['a1'])
  const resp = await http.post(POST_URL + api, postData, {
    headers: {
      'x-s': xsxt['xs'],
      'x-t': xsxt['xt'],
      'x-s-common': xsxt['xs_common'],
      Cookie: cookie[1] as string
    }
  })
  const { success, data } = resp.data
  if (success) {
    return data
  } else {
    return null
  }
}
const saveUserInfo = async (task: DownloadTask) => {
  const savePath = task.path?.split('\\')?.slice(0, -1).join('\\') as string
  if (fs.existsSync(path.join(savePath, task.user.nickname + '.json'))) {
    return
  }
  const userData = await getUserInfo(task.user.user_id as string)
  mkdirsSync(savePath)
  const fsw = fs.createWriteStream(path.join(savePath, renameName(task.user.nickname) + '.json'), {
    encoding: 'utf-8'
  })
  userData && fsw.write(JSON.stringify(userData, null, '\t'))
  fsw.close()
}
const renameName = (nickname: string): string => {
  return nickname.replace(/[\\\/\:\*\?\"\>\<\|\. ]/g, '_')
}
const saveNoteInfo = async (task: DownloadTask) => {
  const { note } = task
  const savePath = task.path as string
  const saveData = {
    ...note,
    cover: null,
    user: null
  }
  mkdirsSync(savePath)
  const fsw = fs.createWriteStream(path.join(savePath, renameName(note.display_title) + '.json'), {
    encoding: 'utf-8'
  })
  saveData && fsw.write(JSON.stringify(saveData, null, '\t'))
  fsw.close()
}

export const downloadResource = async (task: DownloadTask) => {
  BrowserWindow.getAllWindows()[0].webContents.send('task-add', task)
  saveUserInfo(task)
  saveNoteInfo(task)
  const { file: files } = task
  for (let file of files) {
    logger.info(
      `Aria2 DownloadStart: [taskID=${task.rid}][filename=${file.name}] => [filepath=${file.path}]`
    )
    aria2Download(file.url, {
      dir: file.path,
      gid: file.id,
      out: file.name
    })
  }
}
