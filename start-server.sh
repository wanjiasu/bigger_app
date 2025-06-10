#!/bin/bash

# 服务器部署启动脚本
echo "🚀 启动小红书笔记生成器服务器部署..."

# 获取服务器IP地址
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$SERVER_IP" ]; then
    echo "⚠️  无法获取服务器IP，使用默认localhost"
    SERVER_IP="localhost"
fi

echo "📍 检测到服务器IP: $SERVER_IP"

# 创建或更新.env文件中的API URL配置
if [ ! -f ".env" ]; then
    echo "📝 创建.env文件..."
    cp env.example .env
fi

# 更新.env文件中的API URL
if grep -q "NEXT_PUBLIC_API_URL=" .env; then
    sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000|g" .env
else
    echo "NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000" >> .env
fi

# 设置环境变量
export NEXT_PUBLIC_API_URL="http://$SERVER_IP:8000"
echo "🔗 API URL 设置为: $NEXT_PUBLIC_API_URL"

echo "🐳 启动Docker服务..."

# 停止现有服务
docker-compose down

# 重新构建并启动服务
docker-compose build --no-cache frontend
docker-compose up -d

echo "✅ 服务启动完成！"
echo "🌐 前端访问地址: http://$SERVER_IP:3000"
echo "🔧 后端API地址: http://$SERVER_IP:8000"
echo "📊 数据库管理: http://$SERVER_IP:8080"

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📋 服务状态检查:"
docker-compose ps

echo "🎉 部署完成！请访问 http://$SERVER_IP:3000 查看应用"
echo "💡 提示：如需手动配置，请编辑 .env 文件中的 NEXT_PUBLIC_API_URL 变量" 