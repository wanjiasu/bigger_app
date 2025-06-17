-- 使用超级用户创建其他用户和数据库
-- postgres_admin 已经由 POSTGRES_USER 环境变量创建

-- 创建 FastAPI 用户和数据库
CREATE USER fp_user WITH PASSWORD 'fp_pass';
CREATE DATABASE fp_db;
GRANT ALL PRIVILEGES ON DATABASE fp_db TO fp_user;

-- 连接到 FastAPI 数据库并设置权限
\c fp_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO fp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO fp_user;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建小红书笔记表
CREATE TABLE IF NOT EXISTS xiaohongshu_notes (
    id SERIAL PRIMARY KEY,
    input_basic_content TEXT NOT NULL,
    input_note_purpose TEXT,
    input_recent_trends TEXT,
    input_writing_style TEXT,
    input_target_audience TEXT,
    input_content_type TEXT,
    input_reference_links TEXT,
    note_title TEXT,
    note_content TEXT NOT NULL,
    comment_guide TEXT NOT NULL,
    comment_questions TEXT NOT NULL,
    model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 创建客户账号信息表
CREATE TABLE IF NOT EXISTS client_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    topic_keywords JSONB,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 为新表设置权限
GRANT ALL PRIVILEGES ON TABLE users TO fp_user;
GRANT ALL PRIVILEGES ON TABLE xiaohongshu_notes TO fp_user;
GRANT ALL PRIVILEGES ON TABLE client_accounts TO fp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fp_user;