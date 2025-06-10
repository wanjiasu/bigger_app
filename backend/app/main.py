from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import Base, engine, SessionLocal
from app.models import User, XiaohongshuNote
from app.schemas import UserCreate, UserOut, NoteGenerateRequest, NoteCreate, NoteUpdate, NoteOut
from app.deepseek_service import DeepSeekService
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = FastAPI(title="小红书笔记生成器", description="基于DeepSeek的小红书图文笔记生成工具")

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

# 初始化DeepSeek服务
deepseek_service = DeepSeekService()

# 获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 用户相关接口
@app.post("/users/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[UserOut])
def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# 小红书笔记相关接口
@app.post("/notes/generate", response_model=dict)
async def generate_note(request: NoteGenerateRequest, db: Session = Depends(get_db)):
    """生成小红书笔记"""
    try:
        # 调用DeepSeek API生成内容
        result = await deepseek_service.generate_xiaohongshu_note(
            basic_content=request.basic_content,
            note_purpose=request.note_purpose,
            recent_trends=request.recent_trends,
            writing_style=request.writing_style,
            target_audience=request.target_audience,
            content_type=request.content_type,
            reference_links=request.reference_links
        )
        
        if result["success"]:
            # 保存到数据库
            note_data = NoteCreate(
                input_basic_content=request.basic_content,
                input_note_purpose=request.note_purpose,
                input_recent_trends=request.recent_trends,
                input_writing_style=request.writing_style,
                input_target_audience=request.target_audience,
                input_content_type=request.content_type,
                input_reference_links=request.reference_links,
                note_title=result["data"]["note_title"],
                note_content=result["data"]["note_content"],
                comment_guide=result["data"]["comment_guide"],
                comment_questions=result["data"]["comment_questions"]
            )
            
            db_note = XiaohongshuNote(**note_data.dict())
            db.add(db_note)
            db.commit()
            db.refresh(db_note)
            
            return {
                "success": True,
                "message": "笔记生成成功",
                "data": {
                    "id": db_note.id,
                    "note_title": db_note.note_title,
                    "note_content": db_note.note_content,
                    "comment_guide": db_note.comment_guide,
                    "comment_questions": db_note.comment_questions,
                    "created_at": db_note.created_at
                }
            }
        else:
            raise HTTPException(status_code=500, detail=f"生成失败: {result.get('error', '未知错误')}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")

@app.get("/notes/", response_model=List[NoteOut])
def get_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有笔记"""
    notes = db.query(XiaohongshuNote).offset(skip).limit(limit).all()
    return notes

@app.get("/notes/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """获取单个笔记"""
    note = db.query(XiaohongshuNote).filter(XiaohongshuNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return note

@app.put("/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db)):
    """更新笔记"""
    note = db.query(XiaohongshuNote).filter(XiaohongshuNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    update_data = note_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    
    db.commit()
    db.refresh(note)
    return note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """删除笔记"""
    note = db.query(XiaohongshuNote).filter(XiaohongshuNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    db.delete(note)
    db.commit()
    return {"message": "笔记删除成功"}

@app.get("/")
def root():
    return {"message": "小红书笔记生成器 API", "docs": "/docs"}

