const { Wechaty } = require('wechaty')
const { FileBox } = require('file-box')
const FormData = require('form-data')
const axios = require('axios')
const fs = require('fs')

const fund = require('./fund')

const bot = new Wechaty()

const sqllite3 = require('sqlite3').verbose()
const db = new sqllite3.Database('test.db')

const baseConfig = {
  // 百度接口key 黑白图片上色用
  // 申请地址：https://console.bce.baidu.com/ai/#/ai/imageprocess/overview/index
  'api_key': '',
  'secret_key': '',
  // 梗百科 服务端
  'ji': 'https://xxxxxxx.com/xx.php?kw='
}

bot
.on('scan', (qrcode, status) => {

  // 二维码链接
  const qrcodeImageUrl = [
    'https://wechaty.js.org/qrcode/',
    encodeURIComponent(qrcode),
  ].join('')

  console.log(qrcodeImageUrl)

  // 终端生成二维码
  require('qrcode-terminal').generate(qrcode, { small: true })

})
.on('login', user => {
    console.log(user.name())
})
.on('message', async (message) => {
    const room = message.room()
    const content = message.text()
    // 发送给谁
    const toUser = getToUser(message)
    // 说话人
    const talker = message.talker()

    let result
    // !room || await room.topic() !== '萌屋子秃帐子白可爱' ||
    
    // if(message.type() === bot.Message.Type.Recalled && !message.self()) {
    //     if(room && await room.topic() !== '萌屋子秃帐子白可爱') return
    //     result = FileBox.fromUrl('https://imba97.cn/uploads/images/233.jpg')
    // }

    const codeMessage = getCodeMessage(content)
    if(codeMessage !== false) {
      setIsSend(talker.name(), content, 1)
      send(room, toUser, codeMessage)
      return
    }

    // 梗百科
    if(/^梗百科/.test(content)) {

        const keyWordReg = /^梗百科 (.*)/.exec(content)

        if(keyWordReg === null) return

        const keyWord = keyWordReg[1] !== undefined && keyWordReg[1] !== null && keyWordReg[1] !== '' ? keyWordReg[1] : ''

        if(keyWord === '') return

        // 请将接口换成自己的服务端文件
        const response = await axios(`${baseConfig.ji}${encodeURIComponent(keyWord)}`)

        result = response.data.status === 1 ? `[梗百科 ${keyWord}]\n\n${response.data.data.replace(/\\n/g, '\n')}` : response.data.data

        send(room, toUser, result)

        return

    }

    // 基金
    if(/^基金 (\d+)/.test(content)) {

      const keyWordReg = /^基金 (\d+)/.exec(content)

      if(keyWordReg === null) return

      const keyWord = keyWordReg[1] !== undefined && keyWordReg[1] !== null && keyWordReg[1] !== '' ? keyWordReg[1] : ''

      if(keyWord === '') return

      fund.generateImage(keyWord).then(path => {
        send(room, toUser, FileBox.fromFile(path))
        fs.unlinkSync(path)
      })
    }

    // 过滤表情 获取图片
    if((/^[@a-z0-9]/.test(content) || /cdnmidimgurl/.test(content)) && message.type() === bot.Message.Type.Image) {

      let row

      // 以图搜番 关键词 是否发送
      row = await getIsSend(talker.name(), '以图搜番')
      // 获取到了发送关键词
      if(row && row.isSend === 1) {

        const path = await saveImage(message)
  
        const localFile = fs.createReadStream(path)
  
        let formData = new FormData()
        formData.append('image', localFile)
  
        let url = 'https://api.trace.moe/search'
  
        let config = {
            headers: {
                // 'Content-Type': 'multipart/form-data',
                ...formData.getHeaders()
            }
        }
  
        const res = await axios.post(url, formData, config)
  
        if(res.data.error !== '') return
  
        result = []
        result.push(`番名：${res.data.result[0].filename}\n第${res.data.result[0].episode}集\n时间：${Math.floor(res.data.result[0].from/60)}分${Math.floor(res.data.result[0].from%60)}秒`)
        result.push(FileBox.fromUrl(res.data.result[0].video))
  
        send(room, toUser, result)
        await setIsSend(talker.name(), '以图搜番', 0)
  
        // 删除下载的图片
        fs.unlink(path, err => {
          if(err) throw err;
        })
  
        return
      }

      row = await getIsSend(talker.name(), '上色')
      if(row && row.isSend === 1) {

        const path = await saveImage(message)

        const buffer = await fs.readFileSync(path)

        const base64 = buffer.toString('base64')

        const formData = new FormData()
        const token = await getToken()

        formData.append('image', base64)
        let config = {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  ...formData.getHeaders()
              }
          }
        const res = await axios.post(`https://aip.baidubce.com/rest/2.0/image-process/v1/colourize?access_token=${token}`, formData, config)

        if(typeof res.data.image === 'string') {
          const image = FileBox.fromBase64(res.data.image, 'test.png')
          send(room, toUser, image)
          await setIsSend(talker.name(), '上色', 0)
        } else {
          console.log(res.data)
        }

        // 删除下载的图片
        fs.unlink(path, err => {
          if(err) throw err;
        })

        return;

      }

      
    }
 

})
.on('logout', user => {
    console.log(user.name())
})
.start()

async function send(room, user, content) {
  if(!content) return

  if(Array.isArray(content)) {
    content.forEach(async item => {
          if(room) {
              await room.say(item)
          } else {

              await user.say(item)

          }
      })
      return
  }

  if(room) {
      await room.say(content)
  } else {

      await user.say(content)

  }
}

/**
 * 获取消息发送给的人
 */
function getToUser(message) {

  // 不是自己 或 在群聊 就返回 talker 否则返回 to
  return !message.self() || message.room() ? message.talker() : message.to()
}

/**
 * 获取code对应的提示
 * @param {string} text
 * @returns {string | bool} 对应提示 或 false
 */
function getCodeMessage(text) {
  switch(text) {
    case '以图搜番':
    case '上色':
      return '请上传图片'
  }
  return false
}

// 操作DB写的很拉跨，别学我

function getIsSend(username, code) {
  return new Promise((resolve, reject) => {
    initDB(function() {
      db.get(`SELECT isSend FROM order_info where name = ? and code = ?`, [username, code], function(err, row) {
        resolve(row)
      })
    })
  })
}

function setIsSend(username, code, val) {
  return new Promise((resolve, reject) => {
    initDB(function() {
      db.get(`SELECT * FROM order_info where name = ? and code = ?`, [username, code], function(err, row) {
        if(err) reject(err)
        // 如果没有则插入数据
        if(!row) {
          const date = new Date().getTime()
          db.run(`INSERT INTO order_info VALUES (?,?,?,?)`, [ username, code, val, date], function(insertErr) {
            if(insertErr) reject(insertErr)
            resolve({
              name: username,
              code: code,
              isSend: 1,
              date: date
            })
          })
        } else {
          const date = new Date().getTime()
          db.run(`UPDATE order_info SET isSend = ?, date = ? where name = ? and code = ?`, [val, date, username, code])
          resolve({
            name: username,
            code: code,
            isSend: 1,
            date: date
          })
        }
      })
    })
  })
}

function initDB(callback) {
  /**
   * 指令数据库 存储用户发送的指令
   * id
   * name 用户名
   * code 指令码 比如 以图搜番|黑白上色
   * date 发送时间 会有过期
   */
  db.run(`CREATE TABLE IF NOT EXISTS order_info (
    name VARCHAR(255),
    code VARCHAR(255),
    isSend INT,
    date INT
  );`, function(err) {

    console.log(err)

    callback()

  })
}

async function saveImage(message) {
  const fileBox = await message.toFileBox()
  const dirPath = './tempImg'
  if(!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
  const path = `${dirPath}/${fileBox.name}`
  await fileBox.toFile(path)
  return path;
}

async function getToken() {
  return new Promise((resolve, reject) => {
    initDB(function() {
      db.get(`SELECT * FROM order_info where name = 'token'`, async function(err, row) {
        //                                               token 过期  存入时间 + 一个月 < 当前时间 - 一天 （预留一天的时间更新）
        if(!row || (row && row.code === null) || (row && row.date + 2592000 < new Date().getTime() / 1000 - 86400)) {
          console.log('插入 token 数据')
          // 请求 token 请把 APIKey 和 SecretKey 换成自己的
          const token_url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${baseConfig.api_key}&client_secret=${baseConfig.secret_key}`
          const res = await axios.post(token_url)

          // db.run(`DELETE FROM order_info where name = 'token'`)

          // token 跟指令放一个库了 除非保证好友名称没有叫 token 的 不然别放一个库 或者换个名字
          db.run(`INSERT INTO order_info VALUES ('token',?,?,?)`, [ res.data.access_token, 1, new Date().getTime() / 1000], function(insertErr) {
            if(insertErr) reject(insertErr)
            resolve(res.data.access_token)
          })
        }
        resolve(row.code)
      })
    })
  })
}
