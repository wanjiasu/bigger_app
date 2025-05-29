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
    input_scenario = Column(Text, nullable=False)  # 用户输入的痛点场景
    input_persona = Column(String, nullable=True)  # 人设
    input_hotspot = Column(String, nullable=True)  # 热点
    note_title = Column(String, nullable=False)  # 笔记主题
    note_content = Column(Text, nullable=False)  # 笔记正文
    comment_guide = Column(Text, nullable=False)  # 评论区引导文案
    comment_questions = Column(Text, nullable=False)  # 评论区问题
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
