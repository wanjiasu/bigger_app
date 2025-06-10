// API 配置文件
const getApiUrl = () => {
  // 检查是否在浏览器环境
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    // 生产环境使用环境变量设置的 API URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }
  
  // 开发环境
  if (typeof window === 'undefined') {
    // 服务端渲染时使用 Docker 内部网络地址
    return 'http://backend:8000'
  }
  
  // 客户端开发环境使用 localhost
  return 'http://localhost:8000'
}

export const API_BASE_URL = getApiUrl()

// API 端点
export const API_ENDPOINTS = {
  // 笔记相关
  NOTES_GENERATE: `${API_BASE_URL}/notes/generate`,
  NOTES_LIST: `${API_BASE_URL}/notes/`,
  NOTES_DETAIL: (id: number) => `${API_BASE_URL}/notes/${id}`,
  NOTES_UPDATE: (id: number) => `${API_BASE_URL}/notes/${id}`,
  NOTES_DELETE: (id: number) => `${API_BASE_URL}/notes/${id}`,
  
  // 用户相关
  USERS_LIST: `${API_BASE_URL}/users/`,
  USERS_CREATE: `${API_BASE_URL}/users/`,
}

console.log('API Base URL:', API_BASE_URL) 