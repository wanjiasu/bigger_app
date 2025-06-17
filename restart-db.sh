#!/bin/bash

echo "🔄 重新启动数据库以应用新的表结构..."

# 停止并删除数据库容器
echo "📤 停止现有的数据库容器..."
docker-compose stop db
docker-compose rm -f db

# 删除数据库数据卷（可选，如果你想保留现有数据请注释掉下面这行）
echo "🗑️  删除数据库数据卷（这将清除所有现有数据）..."
docker volume rm test-app_postgres_data 2>/dev/null || true

# 重新启动数据库
echo "🚀 重新启动数据库..."
docker-compose up -d db

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 检查数据库状态
echo "✅ 检查数据库状态..."
docker-compose ps db

echo "🎉 数据库重启完成！新的client_accounts表已创建。"
echo "💡 现在可以重新启动后端服务："
echo "   docker-compose restart backend" 