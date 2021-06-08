import axios from 'axios';
import cron from 'node-cron';

// 用户名
const username = '';
// 密码
const password = '';

// 定时任务 （秒 分 时 天 月 星期）
// 目前时 每天 0时 0分 5秒 执行
cron.schedule('5 0 0 * * *', () => {
  doSignin();
});

// 执行签到
function doSignin() {
  // 登录
  axios
    .post(
      'https://www.sonystyle.com.cn/eSolverOmniChannel/account/login.do',
      {
        channel: 'WEB',
        loginID: username,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }
    )
    .then((response) => {
      if (response.data.resultMsg[0].code !== '00') {
        console.error(
          `[error] 登陆失败: ${response.data.resultMsg[0].message}`
        );
        return;
      }
      // 拿到 access token
      const access_token = response.data.resultData.access_token;

      // 签到
      axios
        .post(
          `https://www.sonystyle.com.cn/eSolverOmniChannel/account/signupPoints.do?access_token=${access_token}`,
          null,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        .then((res) => {
          console.log(res.data.resultMsg[0].message);
        });
    });
}
