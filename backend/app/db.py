from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 数据库连接URL，从环境变量获取
DATABASE_URL = os.getenv(
    "FASTAPI_DB_URL",
    "postgresql://fp_user:fp_pass@db:5432/fp_db"  # 默认值
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
