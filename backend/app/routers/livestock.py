from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.database import get_db
from app.models import Livestock

router = APIRouter(prefix="/livestock", tags=["livestock"])

# 1. Định nghĩa khuôn mẫu dữ liệu trả về cho Frontend
class LivestockResponse(BaseModel):
    id: str
    farmer_id: str
    species: str
    tag_number: str
    birth_date: Optional[date] = None
    weight_kg: Optional[float] = None
    health_status: str
    created_at: datetime

    class Config:
        from_attributes = True # Giúp Pydantic đọc được dữ liệu từ SQLAlchemy

# Khuôn mẫu dữ liệu khi Nông dân gửi lên để tạo mới
class LivestockCreate(BaseModel):
    species: str
    tag_number: str
    weight_kg: Optional[float] = None

# 2. API Lấy toàn bộ danh sách vật nuôi
@router.get("/", response_model=List[LivestockResponse])
def get_all_livestock(db: Session = Depends(get_db)):
    # Sắp xếp để con nào mới thêm sẽ hiện lên đầu
    return db.query(Livestock).order_by(Livestock.created_at.desc()).all()

# 3. API Thêm vật nuôi mới
@router.post("/", response_model=LivestockResponse)
def create_livestock(data: LivestockCreate, db: Session = Depends(get_db)):
    new_animal = Livestock(
        farmer_id="farmer-001", 
        species=data.species, 
        tag_number=data.tag_number,
        weight_kg=data.weight_kg
    )
    db.add(new_animal)
    db.commit()
    db.refresh(new_animal)
    return new_animal