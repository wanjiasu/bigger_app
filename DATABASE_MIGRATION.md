# 数据库迁移指南

## 问题描述

您的应用在启动时出现了数据库字段缺失的错误：
```
column xiaohongshu_notes.input_account_name does not exist
```

这表明您的数据库表结构是旧版本，缺少新添加的字段。

## 解决方案

### 方案1：在服务器上手动执行迁移（推荐）

1. **进入运行中的FastAPI容器**：
   ```bash
   docker compose exec fastapi-app bash
   ```

2. **执行数据库迁移**：
   ```bash
   python migration.py --migrate
   ```

3. **查看迁移结果**：
   ```bash
   python migration.py --show
   ```

### 方案2：使用迁移脚本

1. **给脚本添加执行权限**：
   ```bash
   chmod +x backend/migrate.sh
   ```

2. **在容器内执行迁移脚本**：
   ```bash
   docker compose exec fastapi-app ./migrate.sh
   ```

### 方案3：重建数据库（如果数据不重要）

如果您的数据库中没有重要数据，可以选择重建：

1. **停止服务**：
   ```bash
   docker compose down
   ```

2. **删除数据库卷**：
   ```bash
   docker volume rm $(docker volume ls -q | grep postgres)
   ```

3. **重新启动服务**：
   ```bash
   docker compose up -d
   ```

## 迁移脚本说明

项目中包含以下迁移相关文件：

- `backend/migration.py` - 主要迁移脚本
- `backend/migrate.sh` - Shell迁移脚本
- `backend/create_tables.py` - 表创建脚本
- `backend/app/main.py` - 包含启动时自动迁移逻辑

## 需要添加的字段

`xiaohongshu_notes` 表需要添加的字段：
- `input_account_name` (VARCHAR(100))
- `input_account_type` (VARCHAR(50))
- `input_topic_keywords` (TEXT)
- `input_platform` (VARCHAR(50))
- `input_selected_account_id` (INTEGER)
- `model` (VARCHAR(50))
- `updated_at` (TIMESTAMP)

`client_accounts` 表需要添加的字段：
- `updated_at` (TIMESTAMP)

## 验证迁移成功

迁移完成后，重新启动应用：
```bash
docker compose restart fastapi-app
```

检查应用日志确认没有错误：
```bash
docker compose logs fastapi-app
```

## 注意事项

1. **备份数据**：在执行迁移前，建议备份重要数据
2. **测试环境**：先在测试环境验证迁移脚本
3. **权限问题**：确保容器内有足够权限执行迁移脚本

## 故障排除

如果迁移失败，请检查：

1. **数据库连接**：确认数据库服务正常运行
2. **环境变量**：检查数据库连接配置
3. **日志信息**：查看详细错误日志进行诊断

```bash
docker compose logs db_postgres
docker compose logs fastapi-app
``` 