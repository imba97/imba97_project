# 微信机器人

使用 Wechaty 微信开发库做的，[起因](https://imba97.cn/archives/740/)

建议把本项目只作为代码参考，不建议直接用，直接用倒是也可以

代码瞎写的，本来只想做个简单测试玩玩，但越写越上头，写了一堆

乱七八糟，很是拉跨，**不要学我**

# 功能

## 梗百科

发送`梗百科 关键词`可以查询梗的意思

## 基金

发送`基金 基金代码`可以查询半年内单位净值图

## 以图搜番

发送`以图搜番`会提示请上传图片，上传图后即可以图搜番

使用接口 (trace.moe)[https://trace.moe]，日漫为主

## 黑白照片上色

发送`上色`会提示请上传图片，上传图片后即可返回上色后的照片

使用接口 [百度图像增强](https://console.bce.baidu.com/ai/#/ai/imageprocess/overview/index)

### 服务端

用PHP写了个简单的程序，会根据关键词去**小鸡词典**查询，再返回排序最靠前的一个返回

详情可以看一下这个：[PHP服务端](https://github.com/imba97/js/blob/master/code/js-47.server.php)

**注：**本来是用于前端的，因为前端直接请求会跨域，所以加了个后端，如果你完全用nodejs那么可以自行写一个请求获取小鸡词典的数据

我只是懒，就直接用写好的接口了

# 文件

```
📦wechat_bot
 ┣ 📜fund.js 基金处理程序
 ┣ 📜package.json 包（替换原有的）
 ┗ 📜test.js 主程序
```

# 使用方法

如果你跟我一样是个小白，建议先整个这个项目瞧瞧里面的例子：[wechaty-getting-started](https://github.com/wechaty/wechaty-getting-started)

```shell
git clone git@github.com:wechaty/wechaty-getting-started.git
cd wechaty-getting-started
```

把`package.json`替换原有的，然后

```
nmp install
```

再把`test.js`和`fund.js`两个文件复制到里面，可以复制到 examples，或者新建个文件夹

把`baseConfig`配置好

然后使用命令`node ./examples/test.js`启动