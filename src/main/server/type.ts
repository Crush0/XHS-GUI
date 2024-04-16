export interface DownloadTask {
  id: string
  rid?: string
  title: string
  file: IFileItem[]
  progress: number
  path?: string
  user: RedUser
  note?: any
}
export interface AriaDownloadOption {
  gid: string
  dir: string
  [key: string]: any
}
export interface RedUser {
  avatar?: string
  image?: string
  images?: string
  userId: string
  user_id?: string
  nickname: string
  unqiueId: string
  cookies?: string
}
export interface IFileItem {
  type: 'image' | 'video'
  id: string
  task_id?: string
  name: string
  size: number
  url: string
  path: string
  status: Status
  progress: number
  msg?: string
}
export enum Status {
  None = 'none',
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  FINISHED = 'finished',
  ERROR = 'error',
  CANCELED = 'canceled'
}
export interface Comment {
  content: string
  create_time: number
  id: string
  ip_location: string
  like_count: number
  user_info: RedUser
  note_id: string
  sub_comment_count: number
  sub_comment_cursor: string
  sub_comment_has_more: boolean
  sub_comments: Comment[]
  target_comment: {
    id: string
    user_info: RedUser
  }
}
