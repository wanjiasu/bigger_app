from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 直接使用 FASTAPI_DB_URL 环境变量
DATABASE_URL = os.getenv(
    "FASTAPI_DB_URL",
    "postgresql://fp_user:fp_pass@db:5432/fp_db"  # 默认值使用 db 而不是 localhost
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
