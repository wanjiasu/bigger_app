from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import Base, engine, SessionLocal
from app.models import User, XiaohongshuNote
from app.schemas import UserCreate, UserOut, NoteGenerateRequest, NoteCreate, NoteUpdate, NoteOut
from app.services.ai_service import ai_service
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = FastAPI(title="小红书笔记生成器", description="基于多AI模型的小红书图文笔记生成工具")

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

# AI模型相关接口
@app.get("/models/")
async def get_available_models():
    """获取可用的AI模型列表"""
    return {
        "success": True,
        "data": ai_service.get_available_models()
    }

@app.get("/models/test")
async def test_ai_connection():
    """测试AI服务连接"""
    try:
        is_connected = await ai_service.test_connection()
        return {
            "success": is_connected,
            "message": "连接成功" if is_connected else "连接失败"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"连接测试失败: {str(e)}"
        }

# 小红书笔记相关接口
@app.post("/notes/generate", response_model=dict)
async def generate_note(request: NoteGenerateRequest, db: Session = Depends(get_db)):
    """生成小红书笔记"""
    try:
        # 解析选择的模型，如果没有选择则默认使用 gpt-4o
        models = request.ai_model.split(',') if request.ai_model else ['gpt-4o']
        # 过滤空字符串
        models = [model.strip() for model in models if model.strip()]
        if not models:
            models = ['gpt-4o']  # 如果过滤后为空，使用默认模型
        if len(models) > 3:
            raise HTTPException(status_code=400, detail="最多只能选择3个AI模型")

        # 并行调用多个模型生成内容
        results = []
        for model in models:
            try:
                # 调用AI服务生成内容
                result = await ai_service.generate_note(
                    basic_content=request.basic_content,
                    model=model,
                    note_purpose=request.note_purpose,
                    recent_trends=request.recent_trends,
                    writing_style=request.writing_style,
                    target_audience=request.target_audience,
                    content_type=request.content_type,
                    reference_links=request.reference_links
                )
                
                # 保存到数据库
                note_data = NoteCreate(
                    input_basic_content=request.basic_content,
                    input_note_purpose=request.note_purpose,
                    input_recent_trends=request.recent_trends,
                    input_writing_style=request.writing_style,
                    input_target_audience=request.target_audience,
                    input_content_type=request.content_type,
                    input_reference_links=request.reference_links,
                    note_title=result.get("note_title", ""),
                    note_content=result.get("note_content", ""),
                    comment_guide=result.get("comment_guide", ""),
                    comment_questions=result.get("comment_questions", ""),
                    model=model  # 添加模型标识
                )
                
                db_note = XiaohongshuNote(**note_data.dict())
                db.add(db_note)
                db.commit()
                db.refresh(db_note)
                
                # 添加到结果列表
                results.append({
                    "id": db_note.id,
                    "note_title": db_note.note_title,
                    "note_content": db_note.note_content,
                    "comment_guide": db_note.comment_guide,
                    "comment_questions": db_note.comment_questions,
                    "created_at": db_note.created_at,
                    "model": model
                })
                
            except Exception as e:
                print(f"模型 {model} 生成失败: {str(e)}")
                # 继续处理其他模型，不中断整个过程
                continue
        
        if not results:
            raise HTTPException(status_code=500, detail="所有模型生成均失败")
            
        return {
            "success": True,
            "message": f"成功生成 {len(results)} 个模型的内容",
            "data": results
        }
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")

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

