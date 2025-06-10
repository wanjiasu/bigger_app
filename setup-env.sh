#!/bin/bash

# 环境变量配置脚本
echo "🔧 小红书笔记生成器 - 环境变量配置向导"
echo "=================================================="

# 检查是否存在.env文件
if [ -f ".env" ]; then
    echo "⚠️  发现现有的.env文件"
    read -p "是否要覆盖现有配置？(y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "❌ 配置已取消"
        exit 0
    fi
fi

# 复制示例文件
echo "📝 创建.env文件..."
cp env.example .env

# 获取服务器IP
echo ""
echo "🌐 配置API地址"
echo "选择部署环境："
echo "1. 本地开发 (localhost)"
echo "2. 服务器部署 (自动检测IP)"
echo "3. 自定义地址"

read -p "请选择 (1-3): " choice

case $choice in
    1)
        API_URL="http://localhost:8000"
        echo "✅ 配置为本地开发环境"
        ;;
    2)
        SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
        if [ -z "$SERVER_IP" ]; then
            SERVER_IP="localhost"
            echo "⚠️  无法检测服务器IP，使用localhost"
        else
            echo "📍 检测到服务器IP: $SERVER_IP"
        fi
        API_URL="http://$SERVER_IP:8000"
        ;;
    3)
        read -p "请输入API地址 (例如: http://192.168.1.100:8000): " API_URL
        ;;
    *)
        echo "❌ 无效选择，使用默认配置"
        API_URL="http://localhost:8000"
        ;;
esac

# 更新.env文件
sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|g" .env

echo ""
echo "🔑 配置DeepSeek API密钥"
echo "请访问 https://platform.deepseek.com/ 获取API密钥"
read -p "请输入DeepSeek API密钥 (可稍后配置): " deepseek_key

if [ ! -z "$deepseek_key" ]; then
    sed -i.bak "s|DEEPSEEK_API_KEY=.*|DEEPSEEK_API_KEY=$deepseek_key|g" .env
    echo "✅ DeepSeek API密钥已配置"
else
    echo "⚠️  DeepSeek API密钥未配置，请稍后手动编辑.env文件"
fi

echo ""
echo "🔒 配置数据库密码"
read -p "请输入数据库管理员密码 (默认: your_admin_password): " db_password
if [ ! -z "$db_password" ]; then
    sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$db_password|g" .env
fi

read -p "请输入FastAPI数据库密码 (默认: your_fp_password): " fp_password
if [ ! -z "$fp_password" ]; then
    sed -i.bak "s|FASTAPI_PASS=.*|FASTAPI_PASS=$fp_password|g" .env
    sed -i.bak "s|postgresql://fp_user:.*@db:5432/fp_db|postgresql://fp_user:$fp_password@db:5432/fp_db|g" .env
fi

echo ""
echo "✅ 环境配置完成！"
echo "📁 配置文件: .env"
echo "🔗 API地址: $API_URL"
echo ""
echo "🚀 下一步："
echo "1. 检查并编辑 .env 文件中的其他配置"
echo "2. 运行 docker-compose up -d 启动服务"
echo "3. 或运行 ./start-server.sh 一键部署"
echo ""
echo "📝 配置文件内容预览："
echo "================================"
cat .env | grep -E "NEXT_PUBLIC_API_URL|DEEPSEEK_API_KEY|POSTGRES_PASSWORD|FASTAPI_PASS" 