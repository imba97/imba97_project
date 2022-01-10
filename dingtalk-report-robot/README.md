# 介绍

`NodeJs`开发的一个根据`git log`自动生成日报的程序，并可以通过钉钉机器人发到群里

![](https://imba97.cn/uploads/2021/12/report-2021-5.png)

# 使用

## 拉取项目

```shell
git clone git@github.com:imba97/imba97_project.git
```

进入`dingtalk-report-robot`目录

## 安装依赖包

```shell
npm i
```

## 配置

打开`src/config.js`，进行配置

## 安装 pm2 和 自启动包

```shell
npm install pm2 pm2-windows-startup -g
```

`pm2`可以管理`NodeJs`项目，也用于开机启动

## 自启动包安装

```shell
pm2-startup install
```

## 启动项目

```shell
pm2 start 项目目录/src/ding-robot.js --name 名称
```

文件是`ding-robot.js`，注意别启动错了

## 保存

```shell
pm2 save
```

# 博客文章

[《钉钉日报机器人》](https://imba97.cn/archives/751/)
