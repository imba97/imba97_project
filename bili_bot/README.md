# B站器人

可以根据B站私信回复内容

代码可能写的也很乱，但没有完全很乱 [doge]

# 功能

1. 梗百科，查询梗的意思

  ![](https://imba97.cn/uploads/2021/05/bili-bot-1.jpg)

2. 以图搜番，跟微信的区别是，它最后会发送动图，因为不能发视频

  ![](https://imba97.cn/uploads/2021/05/bili-bot-2.jpg)

以图搜番有缓存机制，可以保存mp4和gif，下次不用浪费服务器资源保存mp4、生成gif

**但没有定期清除机制，如果以图搜番使用量过大可能会炸**


# 文件

📦bili_bot
 ┣ 📜common.js 公共 一些配置
 ┣ 📜image.js 图片处理
 ┣ 📜index.js 入口文件
 ┗ 📜package.json

# 使用方法

1. 安装依赖

```shell
npm i
```

2. 配置 `common.js` 中的设置

3. 启动服务

```shell
npm run start
```