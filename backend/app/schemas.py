from pydantic import BaseModel, EmailStr
from typing import Optional, List
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
    created_at: datetime

    class Config:
        from_attributes = True

class NoteGenerateRequest(BaseModel):
    basic_content: str
    note_purpose: Optional[str] = None
    recent_trends: Optional[str] = None
    writing_style: Optional[str] = None
    target_audience: Optional[str] = None
    content_type: Optional[str] = None
    reference_links: Optional[str] = None
    ai_model: Optional[str] = None  # AI模型选择字段
    # 账号信息字段
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    topic_keywords: Optional[str] = None
    platform: Optional[str] = None
    selected_account_id: Optional[int] = None  # 选中的存储账号ID

class NoteCreate(BaseModel):
    input_basic_content: str
    input_note_purpose: Optional[str] = None
    input_recent_trends: Optional[str] = None
    input_writing_style: Optional[str] = None
    input_target_audience: Optional[str] = None
    input_content_type: Optional[str] = None
    input_reference_links: Optional[str] = None
    # 账号信息字段
    input_account_name: Optional[str] = None
    input_account_type: Optional[str] = None
    input_topic_keywords: Optional[str] = None
    input_platform: Optional[str] = None
    input_selected_account_id: Optional[int] = None
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
    input_note_purpose: Optional[str] = None
    input_recent_trends: Optional[str] = None
    input_writing_style: Optional[str] = None
    input_target_audience: Optional[str] = None
    input_content_type: Optional[str] = None
    input_reference_links: Optional[str] = None
    # 账号信息字段
    input_account_name: Optional[str] = None
    input_account_type: Optional[str] = None
    input_topic_keywords: Optional[str] = None
    input_platform: Optional[str] = None
    input_selected_account_id: Optional[int] = None
    note_title: str
    note_content: str
    comment_guide: str
    comment_questions: str
    model: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ClientAccountBase(BaseModel):
    account_name: str
    account_type: str
    topic_keywords: Optional[List[str]] = None
    platform: str

class ClientAccountCreate(ClientAccountBase):
    pass

class ClientAccount(ClientAccountBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
