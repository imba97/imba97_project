import _ from 'lodash'
import axios, { AxiosRequestConfig } from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'https://xyears.cn',
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',

    origin: 'https://xyears.cn',
    referer: 'https://xyears.cn/sg_sign.htm'
  }
})

export default async function request(config: AxiosRequestConfig) {
  const res = await axiosInstance(config)
  return res.data
}
