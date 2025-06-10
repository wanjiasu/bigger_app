#!/bin/bash

echo "🔍 网络连接测试"
echo "=================="

SERVER_IP="172.20.10.2"

echo "1. 测试前端服务 (http://$SERVER_IP:3000)"
curl -s -o /dev/null -w "状态码: %{http_code}, 响应时间: %{time_total}s\n" http://$SERVER_IP:3000

echo "2. 测试后端API (http://$SERVER_IP:8000/notes/)"
curl -s -o /dev/null -w "状态码: %{http_code}, 响应时间: %{time_total}s\n" http://$SERVER_IP:8000/notes/

echo "3. 测试生成笔记API (POST)"
response=$(curl -s -X POST http://$SERVER_IP:8000/notes/generate \
  -H "Content-Type: application/json" \
  -d '{"basic_content": "测试连接"}' \
  -w "%{http_code}")

echo "POST响应状态码: $response"

echo "4. 检查Docker容器状态"
docker-compose ps

echo "5. 检查端口监听情况"
netstat -tlnp | grep -E ":3000|:8000" || echo "无法获取端口信息"

echo "✅ 测试完成"
echo "如果前端和后端都返回200状态码，说明服务正常运行"
echo "请在浏览器中访问: http://$SERVER_IP:3000" 