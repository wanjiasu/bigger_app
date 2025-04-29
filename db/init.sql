-- 使用超级用户创建其他用户和数据库
-- postgres_admin 已经由 POSTGRES_USER 环境变量创建

-- 创建 FastAPI 用户和数据库
CREATE USER fp_user WITH PASSWORD 'fp_pass';
CREATE DATABASE fp_db;
GRANT ALL PRIVILEGES ON DATABASE fp_db TO fp_user;

-- 创建 NocoDB 用户和数据库
CREATE USER noco_user WITH PASSWORD 'noco_pass';
CREATE DATABASE nocodb_db;
GRANT ALL PRIVILEGES ON DATABASE nocodb_db TO noco_user;

-- 设置 FastAPI 数据库权限
\c fp_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO fp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fp_user;

-- 设置 NocoDB 数据库权限
\c nocodb_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO noco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO noco_user;
ALTER USER noco_user WITH SUPERUSER;