import express from 'express'
import { getMeProfile, getUserInfo, getUserInfoByRedId } from '../XHSRequests/User'
import { getFeed, getPosts, downloadResource, getSearchPosts } from '../XHSRequests/Posts'
import { DownloadTask, IFileItem, Status } from '../type'
import { BrowserWindow } from 'electron'
import store from '../../store'
import path from 'path'
import { get_common_headers } from '../utils/header'
import { generateGidString } from '../utils'
import axios from 'axios'
import { getLoginQR, checkLoginQRStatus } from '../XHSRequests/loginAPI'
import logger from '../../logger'
const router = express.Router()
router.use((req, res, next) => {
  // 记录日志 res 和 req
  logger.info(`Express Request [${req.method}] ${req.url}`)
  res.on('finish', () => {
    if (res.statusCode !== 200) {
      logger.error(
        `Express Response ${res.statusCode} ${req.method} ${req.url} ${res.statusMessage}`
      )
    } else {
      logger.info(`Express Response ${res.statusCode} ${req.method} ${req.url}`)
    }
  })
  next()
})
router.get('/ping', (_, res) => {
  res.send({
    code: 200,
    success: true,
    message: 'pong'
  })
})
router.get('/getMe', async (_, res) => {
  res.send(await getMeProfile())
})
router.get('/getUserInfo', async (req, res) => {
  const userId: string = req.query.userId as string
  res.send(await getUserInfo(userId))
})
router.get('/getPosts', async (req, res) => {
  const userId: string = req.query.userId as string
  const cb = async (flag: boolean, data: any, cause?) => {
    BrowserWindow.getAllWindows()[0].webContents.send('fetch-posts', { flag, notes: data })
    if (cause) {
      res.status(cause.status).send(cause.data)
    } else if (flag) {
      res.end()
    }
  }
  getPosts(userId, cb)
})

router.get('/getFeed', async (req, res) => {
  const noteId: string = req.query.noteId as string
  res.send(await getFeed(noteId))
})

const imageDownloadUrl = (image) => {
  const img_url = image['info_list'][1]['url'] as string
  if (img_url.includes('.jpg')) {
    const img_id = img_url.split('/').slice(-3).join('/').split('!')[0]
    return `https://sns-img-qc.xhscdn.com/${img_id}`
  } else if (img_url.includes('spectrum')) {
    const img_id = img_url.split('/').slice(-2).join('/').split('!')[0]
    return `http://sns-webpic.xhscdn.com/${img_id}?imageView2/2/w/format/jpg`
  } else {
    const img_id = img_url.split('/').pop()?.split('!')[0] as string
    return `https://sns-img-qc.xhscdn.com/${img_id}`
  }
}

const videoDownloadUrl = async (noteId) => {
  const url = `https://www.xiaohongshu.com/explore/${noteId}`
  const response = await axios.get(url, {
    headers: get_common_headers()
  })
  const regex = /<meta name="og:video" content="(.*?)">/
  const match = response.data.match(regex)
  if (match && match.length > 1) {
    const videoUrl = match[1]
    return videoUrl
  } else {
    return undefined
  }
}
// 去除特殊字符 \/:*?"<>|.和空格
const renameName = (nickname: string): string => {
  return nickname.replace(/[\\\/\:\*\?\"\>\<\|\. ]/g, '_')
}
router.get('/login_qr', async (_req, res) => {
  res.send(await getLoginQR())
})
router.get('/check_qr_status', async (req, res) => {
  const { qrId, code } = req.query as any
  res.send(await checkLoginQRStatus(qrId, code))
})
router.post('/downloadNotes', async (req, res) => {
  const savePath = JSON.parse((store.get('settings') as string) || '{}').downloadPath
  const notes: Array<any> = req.body.notes as Array<any>
  for (let note of notes) {
    const { type, note_id } = note
    const data = await getFeed(note.note_id)
    const files = [] as Array<IFileItem>
    const noteSavePath = path.join(
      savePath,
      renameName(note.user.nickname) + '_' + note.user.user_id,
      renameName(note.display_title) + '_' + note.note_id
    )
    for (let index = 0; index < data.items.length; index++) {
      const { image_list, video } = data.items[index].note_card
      if (type === 'normal') {
        for (let i = 0; i < image_list.length; i++) {
          const image = image_list[i]
          const file = {
            type: 'image',
            id: generateGidString(16),
            name: note_id + '_' + index + '_' + i + '.png',
            url: imageDownloadUrl(image),
            status: Status.PENDING,
            path: noteSavePath,
            progress: 0
          } as IFileItem
          files.push(file)
        }
      } else {
        const file = {
          type: 'video',
          id: generateGidString(16),
          name: note_id + '_' + index + '.mp4',
          url: (await videoDownloadUrl(note_id)) ?? video.media.stream.h264[0].master_url,
          status: Status.PENDING,
          path: noteSavePath,
          progress: 0
        } as IFileItem
        files.push(file)
      }
    }
    const downloadTask = {
      id: note.note_id,
      rid: generateGidString(16),
      user: note.user,
      progress: 0,
      path: noteSavePath,
      title: note.display_title,
      file: files,
      note: note
    } as DownloadTask
    downloadResource(downloadTask)
  }
  res.send({
    code: 200,
    success: true
  })
})
router.get('/searchPosts', async (req, res) => {
  const keyword = req.query.keyword as string
  const page = req.query.page as string
  res.send(await getSearchPosts(keyword, page))
})
router.get('/getUserInfoByRedId', async (req, res) => {
  const redId = req.query.redId as string
  res.send(await getUserInfoByRedId(redId))
})
router.get('/logout', (_req, res) => {
  store.delete('a1')

  store.delete('webId')
  res.send({
    code: 200,
    success: true
  })
})
export default router
