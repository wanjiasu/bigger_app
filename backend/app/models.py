from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    age = Column(Integer)
    created_at = Column(DateTime, default=func.now())

class XiaohongshuNote(Base):
    __tablename__ = "xiaohongshu_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    input_basic_content = Column(Text, nullable=False)  # 基本内容
    input_note_purpose = Column(Text, nullable=True)  # 笔记目的
    input_recent_trends = Column(Text, nullable=True)  # 近期热梗
    input_writing_style = Column(Text, nullable=True)  # 写作风格
    input_target_audience = Column(Text, nullable=True)  # 内容受众
    input_content_type = Column(Text, nullable=True)  # 内容类型
    input_reference_links = Column(Text, nullable=True)  # 参考链接
    note_title = Column(Text)
    note_content = Column(Text, nullable=False)  # 笔记正文
    comment_guide = Column(Text, nullable=False)  # 评论区引导文案
    comment_questions = Column(Text, nullable=False)  # 评论区问题
    model = Column(String(50), nullable=True)  # 添加模型字段
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
