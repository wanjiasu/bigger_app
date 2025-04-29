from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db import Base, engine, SessionLocal
from app.models import User
from app.schemas import UserCreate
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 添加跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议改为指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库表
Base.metadata.create_all(bind=engine)

# 获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

from typing import List
from app.schemas import UserOut  # 新增返回模型

@app.get("/users/", response_model=List[UserOut])
def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()

