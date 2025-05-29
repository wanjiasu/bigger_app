# 小红书笔记生成器 - 生产环境部署指南

## 📋 目录

- [系统要求](#系统要求)
- [快速部署](#快速部署)
- [详细配置](#详细配置)
- [域名配置](#域名配置)
- [SSL 证书](#ssl-证书)
- [监控配置](#监控配置)
- [备份策略](#备份策略)
- [故障排除](#故障排除)

## 🖥️ 系统要求

### 最低配置
- **CPU**: 2 核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### 推荐配置
- **CPU**: 4 核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **网络**: 100Mbps 带宽

### 软件依赖
- Docker 20.10+
- Docker Compose 2.0+
- Git (可选，用于代码更新)

## 🚀 快速部署

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd xiaohongshu-generator
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.prod.example .env.prod

# 编辑配置文件
nano .env.prod
```

### 3. 启动服务
```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 启动所有服务
./deploy.sh start
```

### 4. 验证部署
```bash
# 检查服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs
```

## ⚙️ 详细配置

### 环境变量配置

编辑 `.env.prod` 文件，配置以下关键参数：

```bash
# 数据库配置
POSTGRES_USER=postgres_admin
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=postgres

# FastAPI 配置
FASTAPI_USER=fp_user
FASTAPI_PASS=your_fastapi_password_here
FASTAPI_DB=fp_db

# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-your-real-deepseek-api-key-here

# 域名配置
DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
FRONTEND_DOMAIN=xiaohongshu.yourdomain.com

# SSL 证书邮箱
ACME_EMAIL=your-email@example.com

# Redis 配置
REDIS_PASSWORD=your_redis_password_here

# 安全配置
JWT_SECRET_KEY=your_jwt_secret_key_here
```

### Docker Compose 配置

生产环境使用 `docker-compose.prod.yml` 配置文件，包含以下服务：

- **Frontend**: Next.js 应用 (端口 3000)
- **Backend**: FastAPI 应用 (端口 8000)
- **Database**: PostgreSQL 数据库 (端口 5432)
- **Redis**: 缓存服务
- **Traefik**: 反向代理和 SSL 终端

## 🌐 域名配置

### DNS 记录配置

在你的域名提供商处添加以下 DNS 记录：

```
A    xiaohongshu.yourdomain.com    -> 你的服务器IP
A    api.yourdomain.com           -> 你的服务器IP
A    traefik.yourdomain.com       -> 你的服务器IP
```

### 修改配置文件

在 `docker-compose.prod.yml` 中替换域名：

```yaml
# 将所有 yourdomain.com 替换为你的实际域名
- "traefik.http.routers.frontend.rule=Host(`xiaohongshu.yourdomain.com`)"
- "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
```

## 🔒 SSL 证书

### 自动 SSL (推荐)

使用 Traefik 自动获取 Let's Encrypt 证书：

1. 确保域名正确解析到服务器
2. 修改 `.env.prod` 中的邮箱地址
3. 启动服务后自动获取证书

### 手动 SSL

如果需要使用自定义证书：

1. 将证书文件放在 `ssl/` 目录
2. 修改 Traefik 配置
3. 重启服务

## 📊 监控配置

### 启动监控服务

```bash
# 启动监控栈
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# 访问监控面板
# Grafana: http://your-server:3001 (admin/admin123)
# Prometheus: http://your-server:9090
```

### 监控指标

- **系统指标**: CPU、内存、磁盘使用率
- **应用指标**: API 响应时间、错误率
- **数据库指标**: 连接数、查询性能
- **容器指标**: 容器资源使用情况

## 💾 备份策略

### 自动备份

```bash
# 创建定时备份任务
crontab -e

# 添加以下行（每天凌晨 2 点备份）
0 2 * * * /path/to/your/project/deploy.sh backup
```

### 手动备份

```bash
# 备份数据库
./deploy.sh backup

# 备份文件将保存为 backup_YYYYMMDD_HHMMSS.sql
```

### 恢复数据

```bash
# 恢复数据库
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres_admin postgres < backup_file.sql
```

## 🔧 常用命令

### 服务管理

```bash
# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看状态
./deploy.sh status

# 查看日志
./deploy.sh logs [service_name]

# 更新服务
./deploy.sh update

# 清理资源
./deploy.sh cleanup
```

### 数据库操作

```bash
# 连接数据库
docker-compose -f docker-compose.prod.yml exec db psql -U postgres_admin postgres

# 查看数据库大小
docker-compose -f docker-compose.prod.yml exec db psql -U postgres_admin -c "SELECT pg_size_pretty(pg_database_size('fp_db'));"
```

## 🚨 故障排除

### 常见问题

#### 1. 服务无法启动

```bash
# 检查日志
./deploy.sh logs

# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# 检查 Docker 状态
docker ps -a
```

#### 2. SSL 证书获取失败

```bash
# 检查域名解析
nslookup xiaohongshu.yourdomain.com

# 检查防火墙
ufw status
iptables -L

# 查看 Traefik 日志
docker-compose -f docker-compose.prod.yml logs traefik
```

#### 3. 数据库连接失败

```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres_admin

# 检查环境变量
docker-compose -f docker-compose.prod.yml exec backend env | grep DB
```

#### 4. API 响应慢

```bash
# 检查系统资源
htop
df -h

# 检查数据库性能
docker-compose -f docker-compose.prod.yml exec db psql -U postgres_admin -c "SELECT * FROM pg_stat_activity;"
```

### 性能优化

#### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_notes_created_at ON xiaohongshu_notes(created_at);
CREATE INDEX idx_notes_scenario ON xiaohongshu_notes(input_scenario);

-- 分析表统计信息
ANALYZE xiaohongshu_notes;
```

#### 2. 应用优化

```bash
# 增加 FastAPI workers
# 在 backend/Dockerfile 中修改：
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### 3. 缓存优化

```bash
# 配置 Redis 缓存
# 在应用中添加缓存逻辑
```

## 📞 技术支持

如果遇到问题，请：

1. 查看日志文件
2. 检查配置文件
3. 参考故障排除章节
4. 提交 Issue 到项目仓库

## 🔄 更新流程

### 代码更新

```bash
# 拉取最新代码
git pull origin main

# 更新服务
./deploy.sh update
```

### 配置更新

```bash
# 修改配置文件
nano .env.prod

# 重启相关服务
./deploy.sh restart
```

---

**注意**: 生产环境部署前请务必测试所有功能，确保配置正确。 