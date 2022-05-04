import fs from 'fs'
import _ from 'lodash'

const path = 'cookies.json'

export function setCookies(obj: Record<string, string | number>) {
  // 先获取原来的
  const cookies = getCookies(CookieType.Object)

  // 合并
  const mergeObj = _.merge(cookies, obj)

  const json = JSON.stringify(mergeObj)
  fs.writeFileSync(path, json)
}

export function getCookies(type: CookieType = CookieType.Cookie) {
  if (!fs.existsSync(path)) return

  const buffer = fs.readFileSync(path)

  const json = buffer.toString()

  switch (type) {
    case CookieType.Object:
      return toJSON(json)
    case CookieType.Cookie:
      return toCookie(json)
  }
}

function toJSON(json: string) {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error(e)
  }

  return {}
}

function toCookie(json: string) {
  const jsonObject = toJSON(json)

  const result: string[] = []

  _.forEach(jsonObject, (value, name) => {
    result.push(`${name}=${value};`)
  })

  return result.join(' ')
}

export enum CookieType {
  Object,
  Cookie
}
