#!/usr/bin/env python3
"""
数据库表创建和更新脚本
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, inspect
from app.db import DATABASE_URL
from app.models import Base

def column_exists(engine, table_name, column_name):
    """检查表中是否存在指定字段"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def create_tables():
    """创建数据库表"""
    engine = create_engine(DATABASE_URL)
    
    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建完成")
    except Exception as e:
        print(f"⚠️  表创建警告: {e}")
    
    # 检查并添加缺失的字段
    with engine.connect() as conn:
        try:
            # 检查 xiaohongshu_notes 表是否存在
            inspector = inspect(engine)
            if 'xiaohongshu_notes' not in inspector.get_table_names():
                print("❌ xiaohongshu_notes 表不存在，请先创建表")
                return
            
            # 需要添加的字段定义
            columns_to_add = [
                ("input_account_name", "VARCHAR(100)"),
                ("input_account_type", "VARCHAR(50)"),
                ("input_topic_keywords", "TEXT"),
                ("input_platform", "VARCHAR(50)"),
                ("input_selected_account_id", "INTEGER"),
                ("model", "VARCHAR(50)"),
                ("updated_at", "TIMESTAMP")
            ]
            
            print("🔍 检查需要添加的字段...")
            
            for column_name, column_type in columns_to_add:
                if not column_exists(engine, 'xiaohongshu_notes', column_name):
                    try:
                        conn.execute(text(f"ALTER TABLE xiaohongshu_notes ADD COLUMN {column_name} {column_type}"))
                        print(f"✅ 成功添加字段: {column_name}")
                    except Exception as e:
                        print(f"❌ 添加字段 {column_name} 失败: {e}")
                else:
                    print(f"ℹ️  字段 {column_name} 已存在")
            
            # 检查并添加 client_accounts 表的字段
            if 'client_accounts' in inspector.get_table_names():
                client_columns = [
                    ("updated_at", "TIMESTAMP")
                ]
                
                for column_name, column_type in client_columns:
                    if not column_exists(engine, 'client_accounts', column_name):
                        try:
                            conn.execute(text(f"ALTER TABLE client_accounts ADD COLUMN {column_name} {column_type}"))
                            print(f"✅ 成功添加 client_accounts 字段: {column_name}")
                        except Exception as e:
                            print(f"❌ 添加 client_accounts 字段 {column_name} 失败: {e}")
            
            conn.commit()
            print("✅ 数据库结构更新完成")
            
        except Exception as e:
            print(f"❌ 更新表结构失败: {e}")
            conn.rollback()

def check_database_structure():
    """检查数据库结构"""
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    print("📊 当前数据库表结构:")
    for table_name in inspector.get_table_names():
        print(f"\n表: {table_name}")
        columns = inspector.get_columns(table_name)
        for col in columns:
            print(f"  - {col['name']}: {col['type']}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='数据库表管理')
    parser.add_argument('--check', action='store_true', help='检查数据库结构')
    args = parser.parse_args()
    
    if args.check:
        check_database_structure()
    else:
        create_tables() 