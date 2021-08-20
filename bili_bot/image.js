/**
 * 处理图片
 */

import sqlite3 from 'sqlite3'
import axios from 'axios'
import { sendMsg } from './index.js'
import fs, { mkdirSync } from 'fs'
import FormData from 'form-data'
import { tempDir, getCommonHeaders } from './config.js'
import { getUrlFileName } from './util.js'
import ffmpeg from 'fluent-ffmpeg'
import crypto from 'crypto'
import _ from 'lodash'
import fetch from 'node-fetch'
import { retry } from 'async'

// 处理图片逻辑
export async function imageHandle(username, url) {
  // 以图搜番
  if ((await getUserIsSend(username, '以图搜番')) === 1) {
    /**
     * 2021年8月21日 00:42:04
     * trace.moe 没法读取 B站图床 的图片了
     * 所以改成把图下载到本地 在带图发送请求
     */

    // 获取图片名称 xxxx.jpg
    const imageName = getUrlFileName(url)

    // 下载图片
    const localPath = await saveFile(url, imageName)

    // 获取本地图片
    const file = fs.createReadStream(localPath)

    // 构造参数
    const formData = new FormData()
    formData.append('image', file)
    // 发起请求
    const res = await fetch('https://api.trace.moe/search?anilistInfo', {
      method: 'POST',
      body: formData
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error(err)
      })

    if (res.error !== '') {
      sendMsg(username, `未设想的错误: ${res.error}`)
    }
    if (res.result.length !== 0) {
      const removedR18 = await removeR18(res.result)

      if (removedR18.length === 0) {
        sendMsg(username, '结果为空')
        return
      }

      const animate = removedR18[0]

      const m = Math.floor(animate.to / 60)
      const s = Math.floor(animate.to % 60)
      const episode =
        animate.episode !== null ? `集数：第${animate.episode}集` : ''
      const result_msg = `名称：${
        animate.anilist.title.native
      }; \n${episode}; \n时间：${m}分${s}秒; \n相似度：${(
        animate.similarity * 100
      ).toFixed(1)}%`

      sendMsg(username, result_msg)

      // 把预览视频地址MD5当成GIF图片名称 方便下次发送
      const fileNameMd5 = crypto
        .createHash('md5')
        .update(animate.video)
        .digest('hex')

      // 如果有则直接发送
      const loadedGif = `${tempDir}/${fileNameMd5}.gif`
      let image = await getUploadedImage(loadedGif)
      // 没有则生成、上传到B站
      if (image === null) {
        const mp4Path = await saveFile(animate.video, fileNameMd5, '.mp4')

        const gif = await mp4ToGif(fileNameMd5, mp4Path)
        // 上传到B站图库 [doge]
        image = await uploadLocalImageToBilibili(gif)
      }

      // 发送图片
      sendMsg(
        username,
        JSON.stringify({
          url: image.image_url,
          width: image.image_width,
          height: image.image_height
        }),
        2
      )

      // 重置
      setUserIsSend(username, '以图搜番', 0)
    }
  }
}

/**
 * 过滤大人的内容
 */
async function removeR18(searchAnimateResult) {
  const ids = []

  _.forEach(searchAnimateResult, (item) => {
    ids.push(item.anilist.id)
  })

  const query = `
    query (\$ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: \$ids, type: ANIME) {
          id
          genres
        }
      }
    }
  `

  const result = await axios.post('https://graphql.anilist.co', {
    query,
    variables: {
      ids
    }
  })

  const media = result.data.data.Page.media

  _.forEach(media, (item) => {
    if (item.genres.indexOf('Hentai') !== -1)
      _.remove(searchAnimateResult, {
        anilist: {
          id: item.id
        }
      })
  })

  return Promise.resolve(searchAnimateResult)
}

async function mp4ToGif(filename, mp4Path) {
  return new Promise((resolve, reject) => {
    const gifPath = `${tempDir}/${filename}.gif`
    // 如果有则直接返回路径
    if (fs.existsSync(gifPath)) {
      resolve(gifPath)
      return
    }
    try {
      ffmpeg(mp4Path)
        .outputOptions('-vf', 'scale=320:-1:flags=lanczos,fps=15')
        .save(gifPath)
      const timeout = 0
      const timer = setInterval(function () {
        if (fs.existsSync(gifPath)) {
          resolve(gifPath)
          clearInterval(timer)
          return
        }
        if (timeout > 50) {
          reject('timeout')
        }
      }, 500)
    } catch (err) {
      reject(err)
    }
  })
}

async function saveFile(url, argFileName, ext = '') {
  const fileName = argFileName || url.substring(url.lastIndexOf('/') + 1)
  if (!fs.existsSync(tempDir)) mkdirSync(tempDir)

  const savePath = `${tempDir}/${fileName}${ext}`
  if (fs.existsSync(savePath)) {
    return savePath
  }

  const data = await getFileData(url)
  fs.writeFileSync(savePath, data, 'binary')
  return savePath
}

// 上传网络图片到B站
export async function uploadToBilibili(imgUrl) {
  // 上传图片
  const localPath = await saveFile(imgUrl)
  uploadLocalImageToBilibili(localPath)
}

// 上传本地图片到B站
export async function uploadLocalImageToBilibili(localPath) {
  const url = 'http://api.vc.bilibili.com/api/v1/drawImage/upload'
  const uploadImageFormData = new FormData()
  uploadImageFormData.append('file_up', fs.createReadStream(localPath))
  uploadImageFormData.append('category', 'daily')

  return axios
    .post(url, uploadImageFormData, {
      headers: {
        ...getCommonHeaders(),
        ...uploadImageFormData.getHeaders()
      }
    })
    .then(async (res) => {
      if (res.data.code === 0)
        return await setUploadedImage(
          localPath,
          res.data.data.image_url,
          res.data.data.image_width,
          res.data.data.image_height
        )
      return res.data.data
    })
}

export function getUserIsSend(username, code) {
  return new Promise((resolve, reject) => {
    initDB(function (db) {
      db.get(
        `SELECT isSend FROM order_info where name = ?`,
        [username],
        function (err, row) {
          if (err) reject(err)

          // 没有则返回 0
          if (!row) {
            resolve(0)
          } else {
            resolve(row.isSend)
          }
        }
      )
    })
  })
}

export function setUserIsSend(username, code, isSend) {
  return new Promise((resolve, reject) => {
    initDB(function (db) {
      db.get(
        `SELECT isSend FROM order_info where name = ?`,
        [username],
        function (err, row) {
          if (err) reject(err)

          // 没有则插入数据
          if (!row) {
            db.run(
              `INSERT INTO order_info VALUES (?, ?, ?, ?)`,
              [username, code, isSend, new Date().getTime()],
              function (insertErr) {
                if (insertErr) reject(insertErr)
                resolve()
              }
            )
          } else {
            db.run(
              `UPDATE order_info SET isSend = ? where name = ? and code = ?`,
              [isSend, username, code],
              function (err, row) {
                if (err) reject(err)
                resolve()
              }
            )
          }
        }
      )
    })
  })
}

export function getFileData(url) {
  return new Promise((resolve) => {
    axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then((res) => {
        resolve(res.data)
      })
  })
}

export function getCodeMessage(code) {
  switch (code) {
    case '以图搜番':
      return '请上传图片(完整的图识别率会高哦，搜索引擎原因，只能搜索日漫)'
  }
  return false
}

/**
 * 获取已存链接的图片（直接用order_info了 懒得新建了）
 * name = filename MD5
 * code = 图片链接
 * @param {string} filename
 * @returns
 */
async function getUploadedImage(filename) {
  return new Promise((resolve, reject) => {
    initDB(function (db) {
      db.get(
        `SELECT * FROM order_info where name = ?`,
        [filename],
        function (err, row) {
          if (err) reject(err)
          if (!row) {
            resolve(null)
            return
          }
          resolve({
            image_url: row.code,
            image_width: row.isSend,
            image_height: row.date
          })
        }
      )
    })
  })
}

async function setUploadedImage(filename, url, width, height) {
  return new Promise((resolve, reject) => {
    initDB(function (db) {
      db.run(
        `INSERT INTO order_info VALUES (?, ?, ?, ?)`,
        [filename, url, width, height],
        function (insertErr) {
          if (insertErr) reject(insertErr)
          resolve({
            image_url: url,
            image_width: width,
            image_height: height
          })
        }
      )
    })
  })
}

/**
 *
 * @param {Function} callback
 */
function initDB(callback) {
  const db = new sqlite3.Database('database.db', function () {
    db.run(
      `CREATE TABLE IF NOT EXISTS order_info (
      name varchar(255),
      code varchar(255),
      isSend int,
      date int
    )`,
      () => {
        callback(db)
      }
    )
  })
}
