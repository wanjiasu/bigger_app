from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    age = Column(Integer)

class XiaohongshuNote(Base):
    __tablename__ = "xiaohongshu_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    input_basic_content = Column(Text, nullable=False)  # 基本内容
    input_note_purpose = Column(String, nullable=True)  # 笔记目的
    input_recent_trends = Column(String, nullable=True)  # 近期热梗
    input_writing_style = Column(String, nullable=True)  # 写作风格
    input_target_audience = Column(String, nullable=True)  # 内容受众
    input_content_type = Column(String, nullable=True)  # 内容类型
    input_reference_links = Column(Text, nullable=True)  # 参考链接
    note_title = Column(String, nullable=False)  # 笔记主题
    note_content = Column(Text, nullable=False)  # 笔记正文
    comment_guide = Column(Text, nullable=False)  # 评论区引导文案
    comment_questions = Column(Text, nullable=False)  # 评论区问题
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
