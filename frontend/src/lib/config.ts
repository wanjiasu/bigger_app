// API 配置
export const config = {
  // API 基础地址 - 使用内网地址进行测试
  // 生产环境请在 .env.local 中设置 NEXT_PUBLIC_API_BASE_URL
  apiBaseUrl: 'http://192.168.0.200:8000',
  
  // 前端地址 - 使用内网地址进行测试
  // 生产环境请在 .env.local 中设置 NEXT_PUBLIC_FRONTEND_URL
  frontendUrl: 'http://192.168.0.200:3000',
} as const;

// API 端点 (注意：FastAPI 需要尾部斜杠)
export const apiEndpoints = {
  users: `${config.apiBaseUrl}/users/`,
} as const; 