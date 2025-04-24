from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

# Customer 스키마
class CustomerBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Designer 스키마
class DesignerBase(BaseModel):
    name: str
    contact: Optional[str] = None
    department: Optional[str] = None
    active: bool = True


class DesignerCreate(DesignerBase):
    pass


class Designer(DesignerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Manufacturer 스키마
class ManufacturerBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    specialties: Optional[str] = None
    active: bool = True


class ManufacturerCreate(ManufacturerBase):
    pass


class Manufacturer(ManufacturerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# OrderDetail 스키마
class OrderDetailBase(BaseModel):
    color_code: str
    color_name: str
    color_type: Optional[str] = None
    size_matrix: Dict[str, int]  # 사이즈별 수량 매트릭스 (예: {"230": 10, "235": 15})
    total_quantity: int = 0


class OrderDetailCreate(OrderDetailBase):
    pass


class OrderDetail(OrderDetailBase):
    id: int
    order_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# ProductionTracking 스키마
class ProductionTrackingBase(BaseModel):
    cutting_received_date: Optional[date] = None
    cutting_received_qty: int = 0
    embroidery_start_date: Optional[date] = None
    embroidery_completed_date: Optional[date] = None
    embroidery_completed_qty: int = 0
    sewing_sent_date: Optional[date] = None
    sewing_sent_qty: int = 0
    status: str = "not_started"
    notes: Optional[str] = None


class ProductionTrackingCreate(ProductionTrackingBase):
    pass


class ProductionTracking(ProductionTrackingBase):
    id: int
    order_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Order 스키마
class OrderBase(BaseModel):
    style_no: str
    customer_id: int
    designer_id: Optional[int] = None
    manufacturer_id: Optional[int] = None
    quoted_price: Optional[float] = None
    approved_price: Optional[float] = None
    order_date: Optional[date] = None
    deadline: Optional[date] = None
    status: str = "pending"
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    order_details: List[OrderDetailCreate]


class Order(OrderBase):
    id: int
    image_path: Optional[str] = None
    total_quantity: int
    created_at: datetime
    updated_at: datetime
    order_details: List[OrderDetail] = []
    production_tracking: Optional[ProductionTracking] = None
    customer: Optional[Customer] = None
    designer: Optional[Designer] = None
    manufacturer: Optional[Manufacturer] = None

    class Config:
        orm_mode = True


# DesignFile 스키마
class DesignFileBase(BaseModel):
    file_path: str
    file_type: str
    version: int = 1


class DesignFileCreate(DesignFileBase):
    pass


class DesignFile(DesignFileBase):
    id: int
    order_id: int
    created_at: datetime

    class Config:
        orm_mode = True