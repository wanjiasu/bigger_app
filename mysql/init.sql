-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS oneapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 确保root用户有正确的权限
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- 使用oneapi数据库
USE oneapi;

-- 创建必要的表（如果one-api没有自动创建的话）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role INTEGER NOT NULL DEFAULT 1,
    status INTEGER NOT NULL DEFAULT 1,
    email VARCHAR(255),
    github_id VARCHAR(255),
    wechat_id VARCHAR(255),
    lark_id VARCHAR(255),
    oidc_id VARCHAR(255),
    access_token VARCHAR(255),
    quota BIGINT NOT NULL DEFAULT 0,
    used_quota BIGINT NOT NULL DEFAULT 0,
    request_count BIGINT NOT NULL DEFAULT 0,
    `group` VARCHAR(255) NOT NULL DEFAULT 'default',
    aff_code VARCHAR(255),
    inviter_id BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    UNIQUE KEY `idx_username` (`username`),
    UNIQUE KEY `idx_github_id` (`github_id`),
    UNIQUE KEY `idx_wechat_id` (`wechat_id`),
    UNIQUE KEY `idx_lark_id` (`lark_id`),
    UNIQUE KEY `idx_oidc_id` (`oidc_id`),
    UNIQUE KEY `idx_access_token` (`access_token`)
);

CREATE TABLE IF NOT EXISTS channels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,
    key VARCHAR(255) NOT NULL,
    status INTEGER NOT NULL DEFAULT 1,
    weight INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME
); 