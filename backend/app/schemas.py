from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    age: int

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    age: int

    class Config:
        orm_mode = True

class NoteGenerateRequest(BaseModel):
    basic_content: str  # 基本内容
    note_purpose: Optional[str] = None  # 笔记目的
    recent_trends: Optional[str] = None  # 近期热梗
    writing_style: Optional[str] = None  # 写作风格
    target_audience: Optional[str] = None  # 内容受众
    content_type: Optional[str] = None  # 内容类型
    reference_links: Optional[str] = None  # 参考链接

class NoteCreate(BaseModel):
    input_basic_content: str
    input_note_purpose: Optional[str] = None
    input_recent_trends: Optional[str] = None
    input_writing_style: Optional[str] = None
    input_target_audience: Optional[str] = None
    input_content_type: Optional[str] = None
    input_reference_links: Optional[str] = None
    note_title: str
    note_content: str
    comment_guide: str
    comment_questions: str

class NoteUpdate(BaseModel):
    note_title: Optional[str] = None
    note_content: Optional[str] = None
    comment_guide: Optional[str] = None
    comment_questions: Optional[str] = None

class NoteOut(BaseModel):
    id: int
    input_basic_content: str
    input_note_purpose: Optional[str]
    input_recent_trends: Optional[str]
    input_writing_style: Optional[str]
    input_target_audience: Optional[str]
    input_content_type: Optional[str]
    input_reference_links: Optional[str]
    note_title: str
    note_content: str
    comment_guide: str
    comment_questions: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
