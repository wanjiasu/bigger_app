#!/usr/bin/env python3
"""
数据库表创建脚本
运行此脚本来创建所有必要的数据库表
"""

from app.db import engine, Base
from app.models import User, XiaohongshuNote, ClientAccount

def create_tables():
    """创建所有数据库表"""
    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 所有数据库表创建成功！")
        print("已创建的表:")
        print("- users")
        print("- xiaohongshu_notes")
        print("- client_accounts")
    except Exception as e:
        print(f"❌ 创建数据库表时出错: {e}")
        raise

if __name__ == "__main__":
    create_tables() 