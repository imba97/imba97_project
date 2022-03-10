const _ = require('lodash')
const moment = require('moment')
const { execSync } = require('child_process')

const config = require('./config')

/**
 * 是否是指定作者
 * @param {string} line 当前行 要匹配的字符串
 * @param {string} name 用户名
 * @param {string} mail 用户邮箱
 * @returns
 */
function isAuthor(line, name, mail) {
  return new RegExp(`Author: ${name} <${mail}>`).test(line)
}

module.exports = {
  /**
   * 获取 log
   * @param {*} key
   * @param {*} path
   * @param {import('./config').USER_INFO} user
   * @returns
   */
  getLog(key, path, user) {
    let result = ''

    try {
      execSync('git pull', {
        cwd: path
      })
    } catch (e) {
      console.log(e)
    }

    const res = execSync(
      `git log --after="${moment()
        .subtract(_.get(process.argv, '2', config.after), 'days')
        .format('YYYY-MM-DD 00:00:00')}"`,
      {
        cwd: path
      }
    )

    const line = res
      .toString()
      .split('\n')
      .filter((item) => item.trim() !== '')

    const commit = []

    let isUser = false

    line.forEach((item) => {
      if (/^commit/.test(item)) {
        isUser = false
        return
      }

      if (/^Author/.test(item)) {
        isUser = isAuthor(item, user.name, user.mail)
      }

      if (
        (user.prefix !== null && !user.prefix.test(item)) ||
        /^(Merge|Author|Date)/.test(item) ||
        !isUser
      ) {
        return
      }

      if (user.prefix === null) {
        commit.push(item.trim())
      } else {
        commit.push(item.replace(user.prefix, '').trim())
      }
    })

    if (commit.length > 0) {
      result += `${key}\n`
      result += commit.map((item) => `● ${item}`).join('\n')
      result += '\n'
    }

    return result
  }
}
