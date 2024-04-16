import { GET, POST } from './http'
const RED = {
  getUserInfo: (userId: string): Promise<any> => GET('/getUserInfo', { userId }),
  getPosts: (userId: string): Promise<any> => GET('/getPosts', { userId }),
  getFeed: (noteId: string): Promise<any> => GET('/getFeed', { noteId }),
  getMeProfile: (): Promise<any> => GET('/getMe'),
  downloadNotes: (notes: string[], saveComment: boolean = false): Promise<any> =>
    POST('/downloadNotes', { notes, saveComment }),
  loginQrCode: (): Promise<any> => GET('/login_qr'),
  checkQrCodeStatus: (qrId: string, code: string): Promise<any> =>
    GET('/check_qr_status', { qrId, code }),
  logout: (): Promise<any> => GET('/logout'),
  getUserInfoByRedId: (redId: string): Promise<any> => GET('/getUserInfoByRedId', { redId }),
  searchPosts: (keyword: string, page: number): Promise<any> =>
    GET('/searchPosts', { keyword, page })
}
export default {
  RED
}
