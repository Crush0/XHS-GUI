import store from "../../../store"
export const getCookies = () => {
  const result = {}
  const cookies_: string = (JSON.parse(store.get('iuser') as string) as any).icookies || ''
  if (cookies_) {
    for (let cookie of cookies_.trim().split(';')) {
      let cookie_ = cookie.split('=')
      try {
        result[cookie_[0].trim()] = cookie_[1].trim()
      } catch (_e) {
        continue
      }
      
    }
    return [result, cookies_]
  }
  return [result, '']
}
