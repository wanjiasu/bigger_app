#!/usr/bin/env python3
"""
数据库迁移脚本 - 专门用于Docker部署时的数据库结构更新
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text, inspect
from app.db import DATABASE_URL
from app.models import Base
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_column_exists(engine, table_name, column_name):
    """检查表中是否存在指定列"""
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        logger.error(f"检查列失败: {e}")
        return False

def migrate_xiaohongshu_notes_table(engine):
    """迁移 xiaohongshu_notes 表结构"""
    table_name = 'xiaohongshu_notes'
    
    # 需要添加的字段
    columns_to_add = [
        ('input_account_name', 'VARCHAR(100)'),
        ('input_account_type', 'VARCHAR(50)'),
        ('input_topic_keywords', 'TEXT'),
        ('input_platform', 'VARCHAR(50)'),
        ('input_selected_account_id', 'INTEGER'),
        ('model', 'VARCHAR(50)'),
        ('updated_at', 'TIMESTAMP')
    ]
    
    with engine.connect() as conn:
        for column_name, column_type in columns_to_add:
            if not check_column_exists(engine, table_name, column_name):
                try:
                    sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                    conn.execute(text(sql))
                    logger.info(f"✅ 成功添加字段: {table_name}.{column_name}")
                except Exception as e:
                    logger.error(f"❌ 添加字段失败 {table_name}.{column_name}: {e}")
            else:
                logger.info(f"ℹ️  字段已存在: {table_name}.{column_name}")
        
        try:
            conn.commit()
        except Exception as e:
            logger.error(f"提交事务失败: {e}")
            conn.rollback()

def migrate_client_accounts_table(engine):
    """迁移 client_accounts 表结构"""
    table_name = 'client_accounts'
    
    # 需要添加的字段
    columns_to_add = [
        ('updated_at', 'TIMESTAMP')
    ]
    
    with engine.connect() as conn:
        for column_name, column_type in columns_to_add:
            if not check_column_exists(engine, table_name, column_name):
                try:
                    sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                    conn.execute(text(sql))
                    logger.info(f"✅ 成功添加字段: {table_name}.{column_name}")
                except Exception as e:
                    logger.error(f"❌ 添加字段失败 {table_name}.{column_name}: {e}")
            else:
                logger.info(f"ℹ️  字段已存在: {table_name}.{column_name}")
        
        try:
            conn.commit()
        except Exception as e:
            logger.error(f"提交事务失败: {e}")
            conn.rollback()

def run_migration():
    """执行数据库迁移"""
    try:
        logger.info("🚀 开始数据库迁移...")
        
        # 创建数据库引擎
        engine = create_engine(DATABASE_URL)
        
        # 创建所有表（如果不存在）
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("✅ 数据库表创建/检查完成")
        except Exception as e:
            logger.warning(f"⚠️  表创建警告: {e}")
        
        # 检查表是否存在
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        logger.info(f"📊 现有表: {existing_tables}")
        
        # 迁移各个表
        if 'xiaohongshu_notes' in existing_tables:
            logger.info("🔧 迁移 xiaohongshu_notes 表...")
            migrate_xiaohongshu_notes_table(engine)
        else:
            logger.warning("⚠️  xiaohongshu_notes 表不存在")
        
        if 'client_accounts' in existing_tables:
            logger.info("🔧 迁移 client_accounts 表...")
            migrate_client_accounts_table(engine)
        else:
            logger.warning("⚠️  client_accounts 表不存在")
        
        logger.info("✅ 数据库迁移完成")
        
    except Exception as e:
        logger.error(f"❌ 数据库迁移失败: {e}")
        raise

def show_table_structure():
    """显示当前数据库表结构"""
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        logger.info("📊 当前数据库表结构:")
        for table_name in inspector.get_table_names():
            logger.info(f"\n表: {table_name}")
            columns = inspector.get_columns(table_name)
            for col in columns:
                nullable = "NULL" if col.get('nullable', True) else "NOT NULL"
                logger.info(f"  - {col['name']}: {col['type']} {nullable}")
                
    except Exception as e:
        logger.error(f"❌ 显示表结构失败: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='数据库迁移工具')
    parser.add_argument('--show', action='store_true', help='显示当前表结构')
    parser.add_argument('--migrate', action='store_true', help='执行数据库迁移')
    
    args = parser.parse_args()
    
    if args.show:
        show_table_structure()
    elif args.migrate:
        run_migration()
    else:
        # 默认执行迁移
        run_migration() 