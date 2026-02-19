import axios from 'axios'
import { message } from 'ant-design-vue'
export const http = axios.create({
  // 默认走相对路径，由调用方在路径中带 /api 前缀，避免出现 /api/api/… 的重复
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000
})
http.interceptors.request.use(cfg => {
  cfg.headers['X-Request-Id'] = crypto.randomUUID?.() || String(Date.now())
  return cfg
})
http.interceptors.response.use(
  r => r,
  e => {
    const msg =
      e?.response?.data?.error?.message ||
      e?.message ||
      '请求失败'
    message.error(msg)
    return Promise.reject(e)
  }
)
