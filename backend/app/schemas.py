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
        from_attributes = True

class NoteGenerateRequest(BaseModel):
    scenario: str  # 痛点场景
    persona: Optional[str] = None  # 人设
    hotspot: Optional[str] = None  # 热点

class NoteCreate(BaseModel):
    input_scenario: str
    input_persona: Optional[str] = None
    input_hotspot: Optional[str] = None
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
    input_scenario: str
    input_persona: Optional[str]
    input_hotspot: Optional[str]
    note_title: str
    note_content: str
    comment_guide: str
    comment_questions: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
