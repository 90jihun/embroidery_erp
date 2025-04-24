from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(
    prefix="/designers",
    tags=["designers"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Designer, status_code=status.HTTP_201_CREATED)
def create_designer(designer: schemas.DesignerCreate, db: Session = Depends(get_db)):
    db_designer = models.Designer(**designer.dict())
    db.add(db_designer)
    db.commit()
    db.refresh(db_designer)
    return db_designer

@router.get("/", response_model=List[schemas.Designer])
def read_designers(skip: int = 0, limit: int = 100, active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Designer)
    if active_only:
        query = query.filter(models.Designer.active == True)
    designers = query.offset(skip).limit(limit).all()
    return designers

@router.get("/{designer_id}", response_model=schemas.Designer)
def read_designer(designer_id: int, db: Session = Depends(get_db)):
    db_designer = db.query(models.Designer).filter(models.Designer.id == designer_id).first()
    if db_designer is None:
        raise HTTPException(status_code=404, detail="디자이너를 찾을 수 없습니다")
    return db_designer

@router.put("/{designer_id}", response_model=schemas.Designer)
def update_designer(designer_id: int, designer: schemas.DesignerCreate, db: Session = Depends(get_db)):
    db_designer = db.query(models.Designer).filter(models.Designer.id == designer_id).first()
    if db_designer is None:
        raise HTTPException(status_code=404, detail="디자이너를 찾을 수 없습니다")
    
    for key, value in designer.dict().items():
        setattr(db_designer, key, value)
    
    db.commit()
    db.refresh(db_designer)
    return db_designer

@router.delete("/{designer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_designer(designer_id: int, db: Session = Depends(get_db)):
    db_designer = db.query(models.Designer).filter(models.Designer.id == designer_id).first()
    if db_designer is None:
        raise HTTPException(status_code=404, detail="디자이너를 찾을 수 없습니다")
    
    # 관련 주문이 있는지 확인
    orders_count = db.query(models.Order).filter(models.Order.designer_id == designer_id).count()
    if orders_count > 0:
        # 관련 주문이 있으면 삭제 대신 비활성화
        db_designer.active = False
        db.commit()
    else:
        # 관련 주문이 없으면 완전히 삭제
        db.delete(db_designer)
        db.commit()
    
    return None

# 디자이너별 작업량 통계
@router.get("/{designer_id}/stats")
def get_designer_stats(designer_id: int, db: Session = Depends(get_db)):
    # 디자이너 확인
    db_designer = db.query(models.Designer).filter(models.Designer.id == designer_id).first()
    if db_designer is None:
        raise HTTPException(status_code=404, detail="디자이너를 찾을 수 없습니다")
    
    # 디자이너의 모든 주문 조회
    orders = db.query(models.Order).filter(models.Order.designer_id == designer_id).all()
    
    # 통계 계산
    total_orders = len(orders)
    total_quantity = sum(order.total_quantity for order in orders)
    
    # 상태별 주문 수
    pending_orders = sum(1 for order in orders if order.status == "pending")
    in_progress_orders = sum(1 for order in orders if order.status == "in_progress")
    completed_orders = sum(1 for order in orders if order.status == "completed")
    
    return {
        "designer_name": db_designer.name,
        "total_orders": total_orders,
        "total_quantity": total_quantity,
        "status_counts": {
            "pending": pending_orders,
            "in_progress": in_progress_orders,
            "completed": completed_orders
        }
    }