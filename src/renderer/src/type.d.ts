export interface DownloadTask {
  id: string
  rid?: string
  path?: string
  title: string
  file: IFileItem[]
  progress: number
  user: RedUser
}
export interface IUser {
  avatar?: string
  images?: string
  userId: string
  nickname: string
  unqiueId: string
  icookies?: string
}
export interface IFileItem {
  type: 'image' | 'video'
  id: string
  name: string
  url: string
  size: number
  path: string
  status: Status
  progress: number
  msg?: string
}
export interface INote {
  id: string
  isSelected: boolean
  cover: string
  type: 'image' | 'video'
  title: string
  interactInfo: {
    likeCount: number
  },
  user: IUser
}
export enum Status {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  FINISHED = 'finished',
  ERROR = 'error',
  CANCELED = 'canceled',
  None = 'none'
}
