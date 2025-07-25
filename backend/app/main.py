from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import Base, engine, SessionLocal
from app.models import User, XiaohongshuNote, ClientAccount
from app.schemas import UserCreate, UserOut, NoteGenerateRequest, NoteCreate, NoteUpdate, NoteOut, ClientAccountCreate, LawnMowerContentRequest, LawnMowerContentResponse
from app import schemas, models
from app.services.ai_service import ai_service
from app.services.lawn_mower_service import LawnMowerService
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv
import asyncio
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging
import json

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化AI服务 - 暂时注释掉重复的初始化
# ai_service = AIService()

# 初始化割草机服务
lawn_mower_service = LawnMowerService()

def run_database_migration():
    """运行数据库迁移"""
    try:
        from sqlalchemy import create_engine, text, inspect
        from app.models import Base
        from app.db import DATABASE_URL
        
        engine = create_engine(DATABASE_URL)
        
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        logger.info("✅ 数据库表创建完成")
        
        # 检查并添加缺失的字段
        inspector = inspect(engine)
        
        if 'xiaohongshu_notes' in inspector.get_table_names():
            with engine.begin() as conn:
                try:
                    # 获取现有字段
                    existing_columns = {col['name'] for col in inspector.get_columns('xiaohongshu_notes')}
                    
                    # 需要的字段
                    required_columns = {
                        'input_account_name': 'VARCHAR(100)',
                        'input_account_type': 'VARCHAR(50)', 
                        'input_topic_keywords': 'TEXT',
                        'input_platform': 'VARCHAR(50)',
                        'input_selected_account_id': 'INTEGER',
                        'model': 'VARCHAR(50)',
                        'updated_at': 'TIMESTAMP'
                    }
                    
                    # 添加缺失的字段
                    for column_name, column_type in required_columns.items():
                        if column_name not in existing_columns:
                            try:
                                conn.execute(text(f"ALTER TABLE xiaohongshu_notes ADD COLUMN {column_name} {column_type}"))
                                logger.info(f"✅ 成功添加字段: {column_name}")
                            except Exception as e:
                                logger.warning(f"⚠️  添加字段 {column_name} 失败: {e}")
                    
                    # engine.begin() 会自动处理commit/rollback
                    logger.info("✅ 数据库结构更新完成")
                    
                except Exception as e:
                    logger.error(f"❌ 数据库迁移失败: {e}")
                    # engine.begin() 会自动rollback
        
    except Exception as e:
        logger.error(f"❌ 数据库迁移异常: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    logger.info("🚀 应用启动中...")
    
    # 运行数据库迁移
    run_database_migration()
    
    # 初始化AI服务
    try:
        # 测试AI服务连接
        if 'ai_service' in globals():
            is_connected = await ai_service.test_connection()
            if is_connected:
                logger.info("🤖 AI服务连接测试成功")
            else:
                logger.warning("⚠️ AI服务连接测试失败")
    except Exception as e:
        logger.error(f"❌ AI服务初始化失败: {e}")
    
    yield
    
    # 关闭时执行
    logger.info("👋 应用关闭中...")

app = FastAPI(
    title="小红书笔记生成器",
    description="基于多AI模型的小红书图文笔记生成工具",
    version="1.0.0",
    lifespan=lifespan
)

# 添加跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议改为指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取当前文件的目录路径
current_dir = os.path.dirname(os.path.abspath(__file__))

@app.get("/api/lawn-mower/products")
async def get_lawn_mower_products():
    try:
        # 构建product_data.json的完整路径
        json_path = os.path.join(current_dir, "data", "product_data.json")
        
        # 读取JSON文件
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Product data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing product data file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
                    reference_links=request.reference_links,
                    account_name=request.account_name,
                    account_type=request.account_type,
                    topic_keywords=request.topic_keywords,
                    platform=request.platform
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
                    input_account_name=request.account_name,
                    input_account_type=request.account_type,
                    input_topic_keywords=request.topic_keywords,
                    input_platform=request.platform,
                    input_selected_account_id=request.selected_account_id,
                    note_title=result.get("note_title", ""),
                    note_content=result.get("note_content", ""),
                    comment_guide=result.get("comment_guide", ""),
                    comment_questions=result.get("comment_questions", "")
                )
                
                db_note = XiaohongshuNote(**note_data.dict(), model=model)
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
    # 手动转换数据以避免序列化问题
    result = []
    for note in notes:
        result.append({
            "id": note.id,
            "input_basic_content": note.input_basic_content,
            "input_note_purpose": note.input_note_purpose,
            "input_recent_trends": note.input_recent_trends,
            "input_writing_style": note.input_writing_style,
            "input_target_audience": note.input_target_audience,
            "input_content_type": note.input_content_type,
            "input_reference_links": note.input_reference_links,
            "input_account_name": note.input_account_name,
            "input_account_type": note.input_account_type,
            "input_topic_keywords": note.input_topic_keywords,
            "input_platform": note.input_platform,
            "input_selected_account_id": note.input_selected_account_id,
            "note_title": note.note_title,
            "note_content": note.note_content,
            "comment_guide": note.comment_guide,
            "comment_questions": note.comment_questions,
            "model": note.model,
            "created_at": note.created_at,
            "updated_at": note.updated_at
        })
    return result

@app.get("/notes/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """获取单个笔记"""
    note = db.query(XiaohongshuNote).filter(XiaohongshuNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return {
        "id": note.id,
        "input_basic_content": note.input_basic_content,
        "input_note_purpose": note.input_note_purpose,
        "input_recent_trends": note.input_recent_trends,
        "input_writing_style": note.input_writing_style,
        "input_target_audience": note.input_target_audience,
        "input_content_type": note.input_content_type,
        "input_reference_links": note.input_reference_links,
        "input_account_name": note.input_account_name,
        "input_account_type": note.input_account_type,
        "input_topic_keywords": note.input_topic_keywords,
        "input_platform": note.input_platform,
        "input_selected_account_id": note.input_selected_account_id,
        "note_title": note.note_title,
        "note_content": note.note_content,
        "comment_guide": note.comment_guide,
        "comment_questions": note.comment_questions,
        "model": note.model,
        "created_at": note.created_at,
        "updated_at": note.updated_at
    }

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

@app.post("/client-accounts/")
def create_client_account(account: ClientAccountCreate, db: Session = Depends(get_db)):
    db_account = models.ClientAccount(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return {
        "id": db_account.id,
        "account_name": db_account.account_name,
        "account_type": db_account.account_type,
        "topic_keywords": db_account.topic_keywords,
        "platform": db_account.platform,
        "created_at": db_account.created_at,
        "updated_at": db_account.updated_at
    }

@app.get("/client-accounts/")
def get_client_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = db.query(models.ClientAccount).offset(skip).limit(limit).all()
    return [
        {
            "id": account.id,
            "account_name": account.account_name,
            "account_type": account.account_type,
            "topic_keywords": account.topic_keywords,
            "platform": account.platform,
            "created_at": account.created_at,
            "updated_at": account.updated_at
        }
        for account in accounts
    ]

@app.get("/client-accounts/{account_id}")
def get_client_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.ClientAccount).filter(models.ClientAccount.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return {
        "id": account.id,
        "account_name": account.account_name,
        "account_type": account.account_type,
        "topic_keywords": account.topic_keywords,
        "platform": account.platform,
        "created_at": account.created_at,
        "updated_at": account.updated_at
    }

@app.delete("/client-accounts/{account_id}")
def delete_client_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.ClientAccount).filter(models.ClientAccount.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}

@app.get("/")
def root():
    return {"message": "小红书笔记生成器 API", "docs": "/docs"}

# 割草机内容生成接口
@app.post("/api/lawn-mower/generate", response_model=LawnMowerContentResponse)
async def generate_lawn_mower_content(request: LawnMowerContentRequest):
    """生成割草机推广内容"""
    try:
        # 处理多模型生成
        all_results = []
        for model in request.ai_model:
            try:
                result = await lawn_mower_service.generate_lawn_mower_content(
                    spu=request.spu,
                    sku=request.sku,
                    language=request.language,
                    target_platform=request.target_platform,
                    opening_hook=request.opening_hook,
                    narrative_perspective=request.narrative_perspective,
                    content_logic=request.content_logic,
                    value_proposition=request.value_proposition,
                    key_selling_points=request.key_selling_points,
                    specific_scenario=request.specific_scenario,
                    user_persona=request.user_persona,
                    content_style=request.content_style,
                    holiday_season=request.holiday_season,
                    ai_model=[model]  # 单个模型
                )
                
                if result.get("success"):
                    result_data = result.get("data", {})
                    result_data["model"] = model
                    all_results.append(result_data)
                    
            except Exception as e:
                logger.error(f"模型 {model} 生成失败: {str(e)}")
                continue
        
        if not all_results:
            return LawnMowerContentResponse(
                success=False,
                error="所有模型生成均失败"
            )
        
        # 返回第一个成功的结果，但包含所有模型的信息
        return LawnMowerContentResponse(
            success=True,
            data={
                "results": all_results,
                "models_used": [result.get("model") for result in all_results]
            }
        )
        
    except Exception as e:
        logger.error(f"割草机内容生成失败: {str(e)}")
        return LawnMowerContentResponse(
            success=False,
            error=f"生成失败: {str(e)}"
        )

