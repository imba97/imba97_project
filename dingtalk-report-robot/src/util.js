const _ = require('lodash')
const moment = require('moment')
const { execSync } = require('child_process')

const config = require('./config')

const after = _.get(process.argv, '2', config.after)
const before = _.get(process.argv, '3', config.after)

const isDate = /\d{4}-\d{2}-\d{2}/.test(after)

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
        cwd: path,
        windowsHide: true
      })
    } catch (e) {
      console.log(e)
    }

    let command = `git log --author="${user.name}" `

    if (isDate) {
      command += `--after="${after} 00:00:00" --before="${before || after} 23:59:59"`
    } else {
      command += `--after="${moment().subtract(after, 'days').format('YYYY-MM-DD 00:00:00')}"`
    }

    const res = execSync(command, {
      cwd: path,
      windowsHide: true
    })

    const line = res
      .toString()
      .split('\n')
      .filter((item) => item.trim() !== '')

    const commit = []

    line.forEach((item) => {
      if ((user.prefix !== null && !user.prefix.test(item)) || /^(Merge|Author|Date)/.test(item)) {
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
      result += commit.reverse().map((item, index) => `${index + 1}. ${item}`).join('\n')
      result += '\n'
    }

    return result
  }
}
