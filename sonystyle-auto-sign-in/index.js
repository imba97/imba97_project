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
  let timeout = 3;
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
          'Content-Type': 'application/json;charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
        }
      }
    )
    .then(async (response) => {
      if (response.data.resultMsg[0].code !== '00') {
        console.log(`[error] 登陆失败: ${response.data.resultMsg[0].message}`);
        if (timeout-- > 0) doSignin();
        return;
      }
      // 拿到 access token
      const access_token = response.data.resultData.access_token;

      // 主站签到
      await axios
        .post(
          `https://www.sonystyle.com.cn/eSolverOmniChannel/account/signupPoints.do?access_token=${access_token}`,
          null,
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
            }
          }
        )
        .then((res) => {
          console.log(`主站签到：${res.data.resultMsg[0].message}`);
        });

      // 社区签到
      axios
        .post(
          'https://www.sonystyle.com.cn/mysony/bbsapp/index.php?app=user&ac=api&api=user&ts=signin',
          {
            channel: 'web'
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`
            }
          }
        )
        .then((response) => {
          console.log(`社区签到：${response.data.msg}`);
        });
    });
}
