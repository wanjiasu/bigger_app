#!/usr/bin/env python3
"""
数据库表创建和更新脚本
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.db import DATABASE_URL
from app.models import Base

def create_tables():
    """创建数据库表"""
    engine = create_engine(DATABASE_URL)
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成")
    
    # 添加新的账号信息字段（如果不存在）
    with engine.connect() as conn:
        try:
            # 检查字段是否已存在，如果不存在则添加
            columns_to_add = [
                ("input_account_name", "VARCHAR(100)"),
                ("input_account_type", "VARCHAR(50)"),
                ("input_topic_keywords", "TEXT"),
                ("input_platform", "VARCHAR(50)"),
                ("input_selected_account_id", "INTEGER")
            ]
            
            for column_name, column_type in columns_to_add:
                try:
                    conn.execute(text(f"ALTER TABLE xiaohongshu_notes ADD COLUMN {column_name} {column_type}"))
                    print(f"✅ 添加字段 {column_name}")
                except Exception as e:
                    if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                        print(f"ℹ️  字段 {column_name} 已存在，跳过")
                    else:
                        print(f"⚠️  添加字段 {column_name} 失败: {e}")
            
            conn.commit()
            
        except Exception as e:
            print(f"❌ 更新表结构失败: {e}")

if __name__ == "__main__":
    create_tables() 