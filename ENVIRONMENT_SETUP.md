# 🌍 环境变量配置指南

## 📋 概述

现在所有的配置都通过环境变量管理，包括API URL、数据库连接、DeepSeek API密钥等。这样的配置方式更加安全和灵活。

## 🚀 快速开始

### 方法1：使用配置向导（推荐）

```bash
# 运行交互式配置脚本
./setup-env.sh
```

### 方法2：手动配置

```bash
# 1. 复制环境变量示例文件
cp env.example .env

# 2. 编辑配置文件
nano .env  # 或使用你喜欢的编辑器
```

### 方法3：自动服务器部署

```bash
# 自动检测服务器IP并配置
./start-server.sh
```

## 📝 环境变量说明

### 🌐 前端API配置

```bash
# 前端连接后端的API地址
NEXT_PUBLIC_API_URL=http://localhost:8000

# 开发环境示例
NEXT_PUBLIC_API_URL=http://localhost:8000

# 服务器部署示例
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000

# 域名部署示例
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**重要说明**：
- `NEXT_PUBLIC_` 前缀的变量会暴露给浏览器端
- 这个变量决定了前端如何连接后端API
- 部署到服务器时必须修改为实际的服务器地址

### 🔑 DeepSeek AI配置

```bash
# DeepSeek API密钥
DEEPSEEK_API_KEY=your_api_key_here
```

获取方式：
1. 访问 [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. 注册并登录账户
3. 生成API密钥
4. 将密钥填入环境变量

### 🗄️ 数据库配置

```bash
# PostgreSQL 管理员配置
POSTGRES_USER=postgres_admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=postgres

# FastAPI 应用数据库配置
FASTAPI_USER=fp_user
FASTAPI_PASS=your_app_password
FASTAPI_DB=fp_db
FASTAPI_DB_URL=postgresql://fp_user:your_app_password@db:5432/fp_db
```

### 📊 NocoDB配置

```bash
# NocoDB 数据库管理界面配置
NOCO_DB_URL=pg://db:5432?u=noco_user&p=your_noco_password&d=nocodb_db
NC_AUTH_JWT_SECRET=your_jwt_secret_here
```

## 🔧 部署场景配置

### 本地开发

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 服务器部署

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://你的服务器IP:8000
```

### 域名部署

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🛠️ 配置验证

### 1. 检查环境变量是否生效

```bash
# 启动服务后查看日志
docker-compose logs frontend | grep "API Base URL"
```

### 2. 运行连接测试

```bash
# 使用测试脚本验证连接
./test-connection.sh
```

### 3. 手动测试API连接

```bash
# 测试后端API
curl http://你的API地址/notes/

# 应该返回JSON格式的笔记列表
```

## 📁 文件结构

```
.
├── .env                 # 实际配置文件（不提交到Git）
├── env.example          # 配置示例文件
├── .env.example         # 旧版配置示例（已废弃）
├── setup-env.sh         # 环境配置向导脚本
├── start-server.sh      # 自动部署脚本
└── test-connection.sh   # 连接测试脚本
```

## ⚠️ 安全注意事项

1. **永远不要提交`.env`文件到Git仓库**
2. **定期更换数据库密码和API密钥**
3. **使用强密码**
4. **在生产环境中使用HTTPS**

## 🐛 常见问题

### Q1: 前端无法连接后端API
**A**: 检查`NEXT_PUBLIC_API_URL`是否设置正确，确保能从浏览器访问该地址

### Q2: DeepSeek API调用失败
**A**: 检查`DEEPSEEK_API_KEY`是否正确设置，确认API密钥有效

### Q3: 数据库连接失败
**A**: 检查数据库密码配置，确保`FASTAPI_DB_URL`中的密码与`FASTAPI_PASS`一致

### Q4: 环境变量未生效
**A**: 重启Docker服务：
```bash
docker-compose down
docker-compose up -d
```

## 🚀 最佳实践

1. **使用配置向导**：`./setup-env.sh`
2. **定期备份配置**：将`.env`文件安全备份
3. **环境隔离**：开发、测试、生产使用不同的配置
4. **监控日志**：定期查看应用日志确认配置正确

---

**需要帮助？** 查看日志或运行测试脚本来诊断问题：
```bash
# 查看服务日志
docker-compose logs

# 运行连接测试
./test-connection.sh
``` 