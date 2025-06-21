# 生产环境部署指南

本指南将帮助您将小红书笔记生成器部署到生产环境。

## 🎯 部署目标

- **服务器**: `81.70.81.234`
- **域名**: `ai.biggeryeah.com`
- **架构**: Docker + Nginx + PostgreSQL + FastAPI + Next.js

## 📋 部署前准备

### 1. 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+
- **内存**: 至少 4GB RAM
- **存储**: 至少 20GB 可用空间
- **网络**: 开放 80, 443 端口

### 2. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp production.env.example .env

# 编辑环境变量文件
nano .env
```

必须配置的变量：
- `POSTGRES_PASSWORD`: 设置强密码
- `ONE_API_KEY`: 您的 One-API 密钥
- `SESSION_SECRET`: 随机生成的密钥

## 🚀 快速部署

### 方法一：使用自动化脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：手动部署

```bash
# 1. 构建并启动服务
docker-compose -f docker-compose.prod.yml up --build -d

# 2. 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 3. 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 域名配置

### 1. DNS 配置

在您的域名服务商管理面板中，添加 A 记录：

```
类型: A
名称: ai
值: 81.70.81.234
```

### 2. 验证 DNS 解析

```bash
nslookup ai.biggeryeah.com
```

## 🔒 SSL 证书配置

### 方式一：Let's Encrypt（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 停止 nginx 容器
docker-compose -f docker-compose.prod.yml stop nginx

# 获取证书
sudo certbot certonly --standalone -d ai.biggeryeah.com

# 复制证书到项目目录
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/ai.biggeryeah.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/ai.biggeryeah.com/privkey.pem ssl/key.pem

# 修改 nginx.conf 启用 SSL
nano nginx.conf
# 取消注释以下两行：
# ssl_certificate /etc/ssl/cert.pem;
# ssl_certificate_key /etc/ssl/key.pem;

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

### 方式二：自签名证书（测试用）

```bash
# 创建 SSL 目录
mkdir -p ssl

# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/CN=ai.biggeryeah.com"
```

## 📊 服务管理

### 常用命令

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f [service_name]

# 重启服务
docker-compose -f docker-compose.prod.yml restart [service_name]

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 更新应用
git pull
docker-compose -f docker-compose.prod.yml up --build -d
```

### 健康检查

```bash
# 检查前端
curl http://localhost/

# 检查后端 API
curl http://localhost/api/

# 检查数据库
docker exec db_postgres_prod pg_isready -U fp_user -d fp_db
```

## 🔧 故障排除

### 常见问题

1. **端口占用**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **容器启动失败**
   ```bash
   docker-compose -f docker-compose.prod.yml logs [service_name]
   ```

3. **数据库连接失败**
   ```bash
   docker exec -it db_postgres_prod psql -U fp_user -d fp_db
   ```

4. **内存不足**
   ```bash
   free -h
   docker system prune -a
   ```

### 日志文件位置

- **Nginx 日志**: 容器内 `/var/log/nginx/`
- **应用日志**: `docker-compose logs -f`
- **系统日志**: `/var/log/syslog`

## 🛡️ 安全建议

1. **防火墙配置**
   ```bash
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 80/tcp  # HTTP
   sudo ufw allow 443/tcp # HTTPS
   sudo ufw enable
   ```

2. **定期更新**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade

   # 更新 Docker 镜像
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **备份数据库**
   ```bash
   docker exec db_postgres_prod pg_dump -U fp_user fp_db > backup_$(date +%Y%m%d).sql
   ```

## 📈 监控和维护

### 磁盘清理

```bash
# 清理 Docker 资源
docker system prune -a -f

# 清理日志文件
sudo truncate -s 0 /var/log/syslog
```

### 自动备份脚本

创建 `/etc/cron.daily/backup-app`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
docker exec db_postgres_prod pg_dump -U fp_user fp_db > $BACKUP_DIR/db_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

## 🎉 部署完成验证

访问以下地址确认部署成功：

- **前端**: http://ai.biggeryeah.com
- **后端 API**: http://ai.biggeryeah.com/api/
- **API 文档**: http://ai.biggeryeah.com/api/docs

## 📞 技术支持

如果遇到问题，请检查：

1. 日志文件
2. 容器状态
3. 网络连接
4. 端口占用
5. 磁盘空间

---

**注意**: 首次部署可能需要较长时间来下载和构建 Docker 镜像，请耐心等待。 