# 十年之约论坛自动签到

每天 `00:00:05` 这个时间点在 [十年之约论坛](https://xyears.cn/) 自动签到

# 使用

1. 安装依赖

`npm i`

2. 登录

   - 2.1 先执行 `npm run login` 获取验证码图片，图片会下载到项目目录下 `vcode.jpg`

   - 2.2 再进行登录 `npm run login 邮箱 密码 验证码`，例如：`npm run login mail@imba97.cn 12341234 3`

3. 启动

`npm run start`

建议放到服务器上运行
