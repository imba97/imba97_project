export const sender_uid = '替换成你的UID'
export const cookie = '替换成你的cookie'
export const csrf = /bili_jct=([a-z0-9]+)/.exec(cookie)[1]

export const commonHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
  Cookie: cookie
};

// 储存视频、动图文件
export const tempDir = './temp'