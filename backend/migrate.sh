#!/bin/bash

# 数据库迁移脚本
# 用于在Docker部署时执行数据库结构更新

echo "🚀 开始数据库迁移..."

# 等待数据库服务启动
echo "⏳ 等待数据库服务启动..."
sleep 10

# 执行迁移
python migration.py --migrate

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移完成"
else
    echo "❌ 数据库迁移失败"
    exit 1
fi

echo "📊 显示当前表结构..."
python migration.py --show 