from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import shutil
import os
import uuid
from datetime import date

from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..utils import image_processor

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)

# 작업지시서 생성
@router.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    style_no: str = Form(...),
    customer_id: int = Form(...),
    designer_id: Optional[int] = Form(None),
    manufacturer_id: Optional[int] = Form(None),
    quoted_price: Optional[float] = Form(None),
    approved_price: Optional[float] = Form(None),
    order_date: Optional[date] = Form(None),
    deadline: Optional[date] = Form(None),
    status: str = Form("pending"),
    notes: Optional[str] = Form(None),
    order_details_json: str = Form(...),  # JSON 문자열로 받음
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 고객사 존재 여부 확인
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="고객사를 찾을 수 없습니다")
    
    # 디자이너 존재 여부 확인 (지정된 경우)
    if designer_id:
        db_designer = db.query(models.Designer).filter(models.Designer.id == designer_id).first()
        if db_designer is None:
            raise HTTPException(status_code=404, detail="디자이너를 찾을 수 없습니다")
    
    # 생산처 존재 여부 확인 (지정된 경우)
    if manufacturer_id:
        db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
        if db_manufacturer is None:
            raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
    
    # 이미지 저장 (제공된 경우)
    image_path = None
    if image:
        # 파일명 생성 (고유 ID 사용)
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        image_path = f"uploads/{unique_filename}"
        
        # 이미지 저장
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    
    # 주문 상세 데이터 파싱
    try:
        order_details_data = json.loads(order_details_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="주문 상세 데이터가 유효한 JSON 형식이 아닙니다")
    
    # 총 수량 계산
    total_quantity = 0
    for detail in order_details_data:
        detail_total = sum(detail.get("size_matrix", {}).values())
        detail["total_quantity"] = detail_total
        total_quantity += detail_total
    
    # 주문 생성
    db_order = models.Order(
        style_no=style_no,
        customer_id=customer_id,
        designer_id=designer_id,
        manufacturer_id=manufacturer_id,
        quoted_price=quoted_price,
        approved_price=approved_price,
        order_date=order_date,
        deadline=deadline,
        status=status,
        notes=notes,
        image_path=image_path,
        total_quantity=total_quantity
    )
    db.add(db_order)
    db.flush()  # ID 생성을 위해 flush
    
    # 주문 상세 생성
    for detail_data in order_details_data:
        db_order_detail = models.OrderDetail(
            order_id=db_order.id,
            color_code=detail_data.get("color_code", ""),
            color_name=detail_data.get("color_name", ""),
            color_type=detail_data.get("color_type"),
            size_matrix=detail_data.get("size_matrix", {}),
            total_quantity=detail_data.get("total_quantity", 0)
        )
        db.add(db_order_detail)
    
    # 생산 추적 데이터 생성
    db_production_tracking = models.ProductionTracking(
        order_id=db_order.id,
        status="not_started"
    )
    db.add(db_production_tracking)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

# 작업지시서 목록 조회
@router.get("/", response_model=List[schemas.Order])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    designer_id: Optional[int] = None,
    manufacturer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Order)
    
    # 필터 적용
    if status:
        query = query.filter(models.Order.status == status)
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)
    if designer_id:
        query = query.filter(models.Order.designer_id == designer_id)
    if manufacturer_id:
        query = query.filter(models.Order.manufacturer_id == manufacturer_id)
    
    # 정렬 (최신순)
    query = query.order_by(models.Order.created_at.desc())
    
    orders = query.offset(skip).limit(limit).all()
    return orders

# 작업지시서 상세 조회
@router.get("/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    return db_order

# 작업지시서 이미지 조회
@router.get("/{order_id}/image")
def read_order_image(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    if not db_order.image_path:
        raise HTTPException(status_code=404, detail="이미지가 없습니다")
    
    return FileResponse(db_order.image_path)

# 작업지시서 업데이트
@router.put("/{order_id}", response_model=schemas.Order)
async def update_order(
    order_id: int,
    style_no: Optional[str] = Form(None),
    customer_id: Optional[int] = Form(None),
    designer_id: Optional[int] = Form(None),
    manufacturer_id: Optional[int] = Form(None),
    quoted_price: Optional[float] = Form(None),
    approved_price: Optional[float] = Form(None),
    order_date: Optional[date] = Form(None),
    deadline: Optional[date] = Form(None),
    status: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    order_details_json: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 작업지시서 존재 여부 확인
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 고객사 확인 (변경된 경우)
    if customer_id and customer_id != db_order.customer_id:
        db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
        if db_customer is None:
            raise HTTPException(status_code=404, detail="고객사를 찾을 수 없습니다")
        db_order.customer_id = customer_id
    
    # 디자이너 확인 (변경된 경우)
    if designer_id and designer_id != db_order.designer_id:
        db_designer = db.query(models.Designer).filter(models.Designer.id == designer_id).first()
        if db_designer is None:
            raise HTTPException(status_code=404, detail="디자이너를 찾을 수 없습니다")
        db_order.designer_id = designer_id
    
    # 생산처 확인 (변경된 경우)
    if manufacturer_id and manufacturer_id != db_order.manufacturer_id:
        db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
        if db_manufacturer is None:
            raise HTTPException(status_code=404, detail="생산처를 찾을 수 없습니다")
        db_order.manufacturer_id = manufacturer_id
    
    # 이미지 업데이트 (새 이미지가 제공된 경우)
    if image:
        # 기존 이미지 삭제
        if db_order.image_path and os.path.exists(db_order.image_path):
            os.remove(db_order.image_path)
        
        # 새 이미지 저장
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        image_path = f"uploads/{unique_filename}"
        
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        db_order.image_path = image_path
    
    # 주문 상세 업데이트 (제공된 경우)
    if order_details_json:
        try:
            order_details_data = json.loads(order_details_json)
            
            # 기존 주문 상세 삭제
            db.query(models.OrderDetail).filter(models.OrderDetail.order_id == order_id).delete()
            
            # 새 주문 상세 및 총 수량 계산
            total_quantity = 0
            for detail_data in order_details_data:
                detail_total = sum(detail_data.get("size_matrix", {}).values())
                detail_data["total_quantity"] = detail_total
                total_quantity += detail_total
                
                db_order_detail = models.OrderDetail(
                    order_id=order_id,
                    color_code=detail_data.get("color_code", ""),
                    color_name=detail_data.get("color_name", ""),
                    color_type=detail_data.get("color_type"),
                    size_matrix=detail_data.get("size_matrix", {}),
                    total_quantity=detail_data.get("total_quantity", 0)
                )
                db.add(db_order_detail)
            
            db_order.total_quantity = total_quantity
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="주문 상세 데이터가 유효한 JSON 형식이 아닙니다")
    
    # 기타 필드 업데이트
    if style_no is not None:
        db_order.style_no = style_no
    if quoted_price is not None:
        db_order.quoted_price = quoted_price
    if approved_price is not None:
        db_order.approved_price = approved_price
    if order_date is not None:
        db_order.order_date = order_date
    if deadline is not None:
        db_order.deadline = deadline
    if status is not None:
        db_order.status = status
    if notes is not None:
        db_order.notes = notes
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

# 작업지시서 삭제
@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 이미지 파일 삭제
    if db_order.image_path and os.path.exists(db_order.image_path):
        os.remove(db_order.image_path)
    
    # 관련 데이터 삭제 (cascade 설정으로 자동 삭제됨)
    db.delete(db_order)
    db.commit()
    
    return None

# 이미지 업로드 및 OCR 처리 (이미지에서 텍스트 추출)
@router.post("/process-image")
async def process_order_image(image: UploadFile = File(...)):
    # 임시 파일로 저장
    temp_file_path = f"uploads/temp_{uuid.uuid4()}{os.path.splitext(image.filename)[1]}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    try:
        # OCR 처리 (utils/image_processor.py에 구현 필요)
        extracted_data = image_processor.extract_order_data(temp_file_path)
        
        # 임시 파일 삭제
        os.remove(temp_file_path)
        
        return extracted_data
    except Exception as e:
        # 임시 파일 삭제
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        raise HTTPException(status_code=500, detail=f"이미지 처리 중 오류 발생: {str(e)}")

# 작업지시서 상태 변경 (간단히 상태만 업데이트)
@router.patch("/{order_id}/status", response_model=schemas.Order)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="작업지시서를 찾을 수 없습니다")
    
    # 상태 업데이트
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    
    return db_order