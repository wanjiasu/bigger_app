from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    age: int

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    age: int

    class Config:
        orm_mode = True
