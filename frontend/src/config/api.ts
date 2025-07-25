// API 配置文件
const getApiUrl = () => {
  // 优先使用环境变量设置的 API URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  if (typeof window === 'undefined') {
    // 服务端渲染时，优先使用 Docker 内部网络地址
    return 'http://backend:8000'
  }
  
  // 浏览器环境 - 根据当前页面URL智能判断
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname
    
    // 如果是 localhost 或 127.0.0.1，使用 localhost:8000
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:8000'
    }
    
    // 生产环境使用nginx代理路径（不加端口号）
    const protocol = window.location.protocol
    return `${protocol}//${currentHost}/api`
  }
  
  // 默认回退
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
  
  // 割草机相关
  LAWN_MOWER_PRODUCTS: `${API_BASE_URL}/api/lawn-mower/products`,
  LAWN_MOWER_GENERATE: `${API_BASE_URL}/api/lawn-mower/generate`,
}

console.log('API Base URL:', API_BASE_URL)
console.log('Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL) 