const { exec } = require('child_process')
const _ = require('lodash')
const iconv = require('iconv-lite')

const config = require('./config')
const { getLog } = require('./util')

let result = ''

_.forEach(config.users_info, (user) => {
  _.forEach(config.projects_path, (path, project_name) => {
    result += getLog(project_name, path, user)
  })
})

exec('clip').stdin.end(iconv.encode(result, 'gbk'))
console.log('已复制')
