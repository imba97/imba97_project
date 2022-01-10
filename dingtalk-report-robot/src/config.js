/**
 * @typedef {{
 *  name: string              // git 用户名
 *  mail: string              // git 用户邮箱
 *  phone?: string            // 选填，钉钉的手机号，用于 @
 *  prefix: RegExp | null     // 提交前缀
 * }} USER_INFO
 */

module.exports = {
  /**
   * 钉钉机器人的 token secret
   * @description 如果不用机器人可以不配置
   */
  ding_talk_robot: {
    token: '',
    secret: ''
  },

  /**
   * 项目目录
   * @description 格式 项目名: 地址
   */
  projects_path: {
    '项目1': 'D:/Projects/1',
    '项目2': 'D:/Projects/2'
  },

  /**
   * 日期 向前捯几天
   * 0 是 今 天 00:00:00
   * 7 是 7天前 00:00:00
   */
  after: 0,

  /**
   * 用户信息
   * @type {USER_INFO[]}
   */
  users_info: [
    {
      name: 'imba97',
      mail: 'mail@imba97.cn',
      phone: '',
      prefix: /report: /
    }
  ]
}
