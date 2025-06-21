# 🚀 生产环境部署检查清单

## 📋 部署前检查

### 服务器准备
- [ ] 服务器可以访问 (SSH连接正常)
- [ ] 服务器已安装 Docker
- [ ] 服务器已安装 Docker Compose
- [ ] 防火墙已开放 80, 443 端口
- [ ] 服务器内存至少 4GB
- [ ] 服务器磁盘空间至少 20GB

### 环境配置
- [ ] 已复制 `production.env.example` 为 `.env`
- [ ] 已设置 `POSTGRES_PASSWORD` (强密码)
- [ ] 已设置 `ONE_API_KEY` (有效的API密钥)
- [ ] 已设置 `SESSION_SECRET` (随机字符串)
- [ ] 已验证 `ONE_API_URL` 可访问

### DNS配置
- [ ] 域名 `ai.biggeryeah.com` 已指向 `81.70.81.234`
- [ ] DNS解析生效 (`nslookup ai.biggeryeah.com`)

## 🎯 部署步骤

### 自动部署
- [ ] 运行 `chmod +x deploy.sh`
- [ ] 运行 `./deploy.sh`
- [ ] 部署脚本执行成功

## ✅ 部署后验证

### 服务状态检查
- [ ] 数据库容器运行正常
- [ ] 后端容器运行正常
- [ ] 前端容器运行正常
- [ ] Nginx容器运行正常

### 功能测试
- [ ] 访问前端页面正常
- [ ] 访问后端API正常
- [ ] 测试笔记生成功能正常
- [ ] 测试AI模型连接正常 