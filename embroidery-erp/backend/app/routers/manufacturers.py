
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(
    prefix="/manufacturers",
    tags=["manufacturers"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Manufacturer, status_code=status.HTTP_201_CREATED)
def create_manufacturer(manufacturer: schemas.ManufacturerCreate, db: Session = Depends(get_db)):
    db_manufacturer = models.Manufacturer(**manufacturer.dict())
    db.add(db_manufacturer)
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer

@router.get("/", response_model=List[schemas.Manufacturer])
def read_manufacturers(skip: int = 0, limit: int = 100, active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Manufacturer)
    if active_only:
        query = query.filter(models.Manufacturer.active == True)
    manufacturers = query.offset(skip).limit(limit).all()
    return manufacturers

@router.get("/{manufacturer_id}", response_model=schemas.Manufacturer)
def read_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if db_manufacturer is None:
        raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
    return db_manufacturer

@router.put("/{manufacturer_id}", response_model=schemas.Manufacturer)
def update_manufacturer(manufacturer_id: int, manufacturer: schemas.ManufacturerCreate, db: Session = Depends(get_db)):
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if db_manufacturer is None:
        raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
    
    for key, value in manufacturer.dict().items():
        setattr(db_manufacturer, key, value)
    
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer

@router.delete("/{manufacturer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if db_manufacturer is None:
        raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
    
    # 관련 주문이 있는지 확인
    orders_count = db.query(models.Order).filter(models.Order.manufacturer_id == manufacturer_id).count()
    if orders_count > 0:
        # 관련 주문이 있으면 삭제 대신 비활성화
        db_manufacturer.active = False
        db.commit()
    else:
        # 관련 주문이 없으면 완전히 삭제
        db.delete(db_manufacturer)
        db.commit()
    
    return None

# 생산처별 작업량 통계
@router.get("/{manufacturer_id}/stats")
def get_manufacturer_stats(manufacturer_id: int, db: Session = Depends(get_db)):
    # 생산처 확인
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if db_manufacturer is None:
        raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
    
    # 생산처의 모든 주문 조회
    orders = db.query(models.Order).filter(models.Order.manufacturer_id == manufacturer_id).all()
    
    # 통계 계산
    total_orders = len(orders)
    total_quantity = sum(order.total_quantity for order in orders)
    
    # 상태별 주문 수
    pending_orders = sum(1 for order in orders if order.status == "pending")
    in_progress_orders = sum(1 for order in orders if order.status == "in_progress")
    completed_orders = sum(1 for order in orders if order.status == "completed")
    
    return {
        "manufacturer_name": db_manufacturer.name,
        "total_orders": total_orders,
        "total_quantity": total_quantity,
        "status_counts": {
            "pending": pending_orders,
            "in_progress": in_progress_orders,
            "completed": completed_orders
        }
    }

# 생산처 출고 현황
@router.get("/{manufacturer_id}/shipments")
def get_manufacturer_shipments(manufacturer_id: int, db: Session = Depends(get_db)):
    # 생산처 확인
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if db_manufacturer is None:
        raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
    
    # 생산처로 출고된 주문 및 생산 추적 정보 조회
    shipments = db.query(models.Order, models.ProductionTracking)\
        .join(models.ProductionTracking, models.Order.id == models.ProductionTracking.order_id)\
        .filter(models.Order.manufacturer_id == manufacturer_id)\
        .filter(models.ProductionTracking.sewing_sent_qty > 0)\
        .all()
    
    result = []
    for order, tracking in shipments:
        result.append({
            "order_id": order.id,
            "style_no": order.style_no,
            "total_quantity": order.total_quantity,
            "sent_quantity": tracking.sewing_sent_qty,
            "remaining_quantity": order.total_quantity - tracking.sewing_sent_qty,
            "sent_date": tracking.sewing_sent_date,
            "status": order.status
        })
    
    return result