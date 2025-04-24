from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(
    prefix="/production",
    tags=["production"],
    responses={404: {"description": "Not found"}},
)

# 특정 작업지시서의 생산 추적 정보 조회
@router.get("/{order_id}", response_model=schemas.ProductionTracking)
def read_production_tracking(order_id: int, db: Session = Depends(get_db)):
    db_tracking = db.query(models.ProductionTracking).filter(models.ProductionTracking.order_id == order_id).first()
    if db_tracking is None:
        raise HTTPException(status_code=404, detail="생산 추적 정보를 찾을 수 없습니다")
    return db_tracking

# 생산 추적 정보 업데이트
@router.put("/{order_id}", response_model=schemas.ProductionTracking)
def update_production_tracking(
    order_id: int, 
    tracking_data: schemas.ProductionTrackingCreate, 
    db: Session = Depends(get_db)
):
    # 작업지시서 확인
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 생산 추적 정보 확인
    db_tracking = db.query(models.ProductionTracking).filter(models.ProductionTracking.order_id == order_id).first()
    if db_tracking is None:
        # 없으면 새로 생성
        db_tracking = models.ProductionTracking(order_id=order_id)
        db.add(db_tracking)
    
    # 데이터 업데이트
    for key, value in tracking_data.dict().items():
        setattr(db_tracking, key, value)
    
    # 주문 상태 자동 업데이트
    if tracking_data.status == "not_started":
        db_order.status = "pending"
    elif tracking_data.status in ["cutting_received", "embroidery_in_progress"]:
        db_order.status = "in_progress"
    elif tracking_data.status == "embroidery_completed":
        # 봉제 출고 여부에 따라 상태 결정
        if tracking_data.sewing_sent_qty >= db_order.total_quantity:
            db_order.status = "completed"
        else:
            db_order.status = "in_progress"
    elif tracking_data.status == "sewing_sent" and tracking_data.sewing_sent_qty >= db_order.total_quantity:
        db_order.status = "completed"
    
    db.commit()
    db.refresh(db_tracking)
    
    return db_tracking

# 재단 입고 등록
@router.post("/{order_id}/cutting-received", response_model=schemas.ProductionTracking)
def register_cutting_received(
    order_id: int,
    quantity: int,
    received_date: Optional[date] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # 작업지시서 확인
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 생산 추적 정보 확인
    db_tracking = db.query(models.ProductionTracking).filter(models.ProductionTracking.order_id == order_id).first()
    if db_tracking is None:
        # 없으면 새로 생성
        db_tracking = models.ProductionTracking(order_id=order_id)
        db.add(db_tracking)
    
    # 재단 입고 등록
    db_tracking.cutting_received_date = received_date or date.today()
    db_tracking.cutting_received_qty += quantity
    
    if notes:
        db_tracking.notes = notes
    
    # 상태 업데이트
    if db_tracking.status == "not_started":
        db_tracking.status = "cutting_received"
    
    # 주문 상태 업데이트
    db_order.status = "in_progress"
    
    db.commit()
    db.refresh(db_tracking)
    
    return db_tracking

# 자수 작업 시작 등록
@router.post("/{order_id}/embroidery-start", response_model=schemas.ProductionTracking)
def register_embroidery_start(
    order_id: int,
    start_date: Optional[date] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # 작업지시서 확인
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 생산 추적 정보 확인
    db_tracking = db.query(models.ProductionTracking).filter(models.ProductionTracking.order_id == order_id).first()
    if db_tracking is None:
        raise HTTPException(status_code=400, detail="먼저 재단 입고를 등록해야 합니다")
    
    # 자수 작업 시작 등록
    db_tracking.embroidery_start_date = start_date or date.today()
    
    if notes:
        db_tracking.notes = notes
    
    # 상태 업데이트
    db_tracking.status = "embroidery_in_progress"
    
    db.commit()
    db.refresh(db_tracking)
    
    return db_tracking

# 자수 완료 등록
@router.post("/{order_id}/embroidery-completed", response_model=schemas.ProductionTracking)
def register_embroidery_completed(
    order_id: int,
    quantity: int,
    completed_date: Optional[date] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # 작업지시서 확인
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 생산 추적 정보 확인
    db_tracking = db.query(models.ProductionTracking).filter(models.ProductionTracking.order_id == order_id).first()
    if db_tracking is None or db_tracking.status not in ["cutting_received", "embroidery_in_progress"]:
        raise HTTPException(status_code=400, detail="자수 작업 시작이 등록되지 않았습니다")
    
    # 자수 완료 등록
    db_tracking.embroidery_completed_date = completed_date or date.today()
    db_tracking.embroidery_completed_qty += quantity
    
    if notes:
        db_tracking.notes = notes
    
    # 상태 업데이트
    if db_tracking.embroidery_completed_qty >= db_tracking.cutting_received_qty:
        db_tracking.status = "embroidery_completed"
    
    db.commit()
    db.refresh(db_tracking)
    
    return db_tracking

# 봉제 출고 등록
@router.post("/{order_id}/sewing-sent", response_model=schemas.ProductionTracking)
def register_sewing_sent(
    order_id: int,
    quantity: int,
    sent_date: Optional[date] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # 작업지시서 확인
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 생산 추적 정보 확인
    db_tracking = db.query(models.ProductionTracking).filter(models.ProductionTracking.order_id == order_id).first()
    if db_tracking is None or db_tracking.embroidery_completed_qty < quantity:
        raise HTTPException(status_code=400, detail="자수 완료된 수량보다 많은 수량을 출고할 수 없습니다")
    
    # 봉제 출고 등록
    db_tracking.sewing_sent_date = sent_date or date.today()
    db_tracking.sewing_sent_qty += quantity
    
    if notes:
        db_tracking.notes = notes
    
    # 상태 업데이트
    if db_tracking.sewing_sent_qty >= db_order.total_quantity:
        db_tracking.status = "sewing_sent"
        db_order.status = "completed"
    
    db.commit()
    db.refresh(db_tracking)
    
    return db_tracking

# 생산 현황 통계
@router.get("/stats/overview")
def get_production_stats(
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # 기본 쿼리
    query = db.query(models.Order, models.ProductionTracking)\
        .join(models.ProductionTracking, models.Order.id == models.ProductionTracking.order_id)
    
    # 필터 적용
    if from_date:
        query = query.filter(models.Order.order_date >= from_date)
    if to_date:
        query = query.filter(models.Order.order_date <= to_date)
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)
    
    # 데이터 조회
    results = query.all()
    
    # 통계 계산
    total_orders = len(results)
    total_quantity = sum(order.total_quantity for order, _ in results)
    cutting_received = sum(tracking.cutting_received_qty for _, tracking in results)
    embroidery_completed = sum(tracking.embroidery_completed_qty for _, tracking in results)
    sewing_sent = sum(tracking.sewing_sent_qty for _, tracking in results)
    
    # 상태별 주문 수
    status_counts = {
        "pending": sum(1 for order, _ in results if order.status == "pending"),
        "in_progress": sum(1 for order, _ in results if order.status == "in_progress"),
        "completed": sum(1 for order, _ in results if order.status == "completed")
    }
    
    return {
        "total_orders": total_orders,
        "total_quantity": total_quantity,
        "cutting_received": cutting_received,
        "embroidery_completed": embroidery_completed,
        "sewing_sent": sewing_sent,
        "status_counts": status_counts
    }