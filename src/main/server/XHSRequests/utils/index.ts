import fs from 'node:fs'
import path from 'node:path'
export function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
  return false
}

export function genRandomString(t) {
  var e = 'abcdefghijklmnopqrstuvwxyz1234567890'
  for (var r = '', n = 0; n < t; n++) r += e.charAt(Math.floor(Math.random() * e.length))
  return r
}
const crc32 = function (t) {
  for (var e, r = [] as any, n = 0; n < 256; n++) {
    e = n
    for (var o = 0; o < 8; o++) e = 1 & e ? 3988292384 ^ (e >>> 1) : e >>> 1
    r[n] = e
  }
  for (var i = -1, a = 0; a < t.length; a++) i = (i >>> 8) ^ r[255 & (i ^ t.charCodeAt(a))]
  return ~i >>> 0
}
export function generateLocalId() {
  let u = (+new Date()).toString(16) + genRandomString(30) + '50000'
  u += crc32(u)
  return u.substring(0, 52)
}
