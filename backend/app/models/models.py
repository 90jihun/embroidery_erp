from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 관계 설정
    orders = relationship("Order", back_populates="customer")


class Designer(Base):
    __tablename__ = "designers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String)
    department = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 관계 설정
    orders = relationship("Order", back_populates="designer")


class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    phone = Column(String)
    address = Column(String)
    specialties = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 관계 설정
    orders = relationship("Order", back_populates="manufacturer")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    style_no = Column(String, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    designer_id = Column(Integer, ForeignKey("designers.id"))
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"))
    quoted_price = Column(Float)  # 견적 단가
    approved_price = Column(Float)  # 인정 단가
    order_date = Column(Date, default=func.current_date())
    deadline = Column(Date)
    status = Column(String, default="pending")  # pending, in_progress, completed
    total_quantity = Column(Integer, default=0)
    image_path = Column(String, nullable=True)  # 작업지시서 이미지 경로
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 관계 설정
    customer = relationship("Customer", back_populates="orders")
    designer = relationship("Designer", back_populates="orders")
    manufacturer = relationship("Manufacturer", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order", cascade="all, delete-orphan")
    production_tracking = relationship("ProductionTracking", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderDetail(Base):
    __tablename__ = "order_details"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    color_code = Column(String)
    color_name = Column(String)
    color_type = Column(String, nullable=True)  # 예: P (프린트), SN (자수)
    size_matrix = Column(JSON)  # 사이즈별 수량을 JSON으로 저장
    total_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 관계 설정
    order = relationship("Order", back_populates="order_details")


class ProductionTracking(Base):
    __tablename__ = "production_tracking"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True)
    cutting_received_date = Column(Date, nullable=True)
    cutting_received_qty = Column(Integer, default=0)
    embroidery_start_date = Column(Date, nullable=True)
    embroidery_completed_date = Column(Date, nullable=True)
    embroidery_completed_qty = Column(Integer, default=0)
    sewing_sent_date = Column(Date, nullable=True)
    sewing_sent_qty = Column(Integer, default=0)
    status = Column(String, default="not_started")  # not_started, cutting_received, embroidery_in_progress, embroidery_completed, sewing_sent
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 관계 설정
    order = relationship("Order", back_populates="production_tracking")


class DesignFile(Base):
    __tablename__ = "design_files"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    file_path = Column(String)
    file_type = Column(String)  # design, digitizing
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    
    # 관계 설정
    order = relationship("Order")