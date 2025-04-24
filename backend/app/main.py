from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine
from .models import models

# 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

# 정적 파일 저장을 위한 디렉토리 생성
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="자수업체 ERP 시스템", description="자수업체를 위한 맞춤형 ERP 시스템 API")

# CORS 설정 - 프론트엔드에서 API 호출 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시에는 특정 도메인으로 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 제공 (업로드된 이미지 등)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 라우터 임포트
from .routers import orders, customers, designers, manufacturers, production

# 라우터 등록
app.include_router(orders.router)
app.include_router(customers.router)
app.include_router(designers.router)
app.include_router(manufacturers.router)
app.include_router(production.router)

@app.get("/")
def read_root():
    return {"message": "자수업체 ERP 시스템 API에 오신 것을 환영합니다!"}