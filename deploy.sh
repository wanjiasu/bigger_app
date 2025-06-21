#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署小红书笔记生成器到生产环境..."

# 检查必要文件
echo "📋 检查必要文件..."
if [ ! -f docker-compose.prod.yml ]; then
    echo "❌ 缺少 docker-compose.prod.yml 文件"
    exit 1
fi

if [ ! -f nginx.conf ]; then
    echo "❌ 缺少 nginx.conf 文件"
    exit 1
fi

if [ ! -f .env ]; then
    echo "⚠️  缺少 .env 文件，请复制 production.env.example 并配置"
    echo "cp production.env.example .env"
    echo "然后编辑 .env 文件填入实际配置"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# 清理旧镜像（可选）
echo "🧹 清理旧镜像..."
docker system prune -f

# 构建新镜像
echo "🔨 构建新镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 启动服务
echo "🌟 启动生产环境服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动完成..."
sleep 30

# 健康检查
echo "🏥 执行健康检查..."

# 检查数据库
echo "检查数据库连接..."
if docker exec db_postgres_prod pg_isready -U fp_user -d fp_db; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败"
    exit 1
fi

# 检查后端API
echo "检查后端API..."
if curl -f http://localhost/api/ > /dev/null 2>&1; then
    echo "✅ 后端API正常"
else
    echo "⚠️  后端API检查失败，可能仍在启动中"
fi

# 检查前端
echo "检查前端服务..."
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ 前端服务正常"
else
    echo "⚠️  前端服务检查失败，可能仍在启动中"
fi

# 显示服务状态
echo ""
echo "📊 服务状态:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 部署完成！"
echo ""
echo "📍 访问地址:"
echo "   - 本地访问: http://localhost"
echo "   - 域名访问: http://ai.biggeryeah.com (需要配置DNS)"
echo ""
echo "📝 下一步操作:"
echo "   1. 配置域名 ai.biggeryeah.com 指向 81.70.81.234"
echo "   2. 配置SSL证书 (可选，推荐使用 Let's Encrypt)"
echo "   3. 检查防火墙设置，确保80和443端口开放"
echo ""
echo "🔧 管理命令:"
echo "   查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "   重启服务: docker-compose -f docker-compose.prod.yml restart"
echo "   停止服务: docker-compose -f docker-compose.prod.yml down"
echo "" 