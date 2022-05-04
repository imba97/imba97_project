import { AxiosResponse } from 'axios'
import _ from 'lodash'

interface FindSetHeaderResult {
  cookie: string
  value: string | null
}

export const findSetHeader = (
  response: AxiosResponse,
  name: string,
  exclude?: string
): FindSetHeaderResult | null => {
  let result: FindSetHeaderResult | null = null

  const reg = new RegExp(`${name}=(.*?);`)
  _.forEach(_.get(response, 'headers.set-cookie'), (cookie) => {
    const regExec = reg.exec(cookie)
    if (regExec) {
      const cookie = _.get(regExec, '0', null)
      const value = _.get(regExec, '1', null)

      // 排除值 继续下一次迭代
      if (exclude && value === exclude) {
        return true
      }

      result = {
        cookie,
        value
      }

      return false
    }
  })

  return result
}
