import os
import re
import json
from typing import Dict, Any, List, Optional
import pytesseract
from PIL import Image
from datetime import datetime

# OCR 설정
# Windows의 경우 pytesseract 경로 설정이 필요할 수 있음
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_path: str) -> Image.Image:
    """이미지 전처리 함수"""
    image = Image.open(image_path)
    
    # 그레이스케일로 변환
    if image.mode != 'L':
        image = image.convert('L')
    
    # 이미지 확대 (선택적)
    # image = image.resize((int(image.width * 1.5), int(image.height * 1.5)), Image.LANCZOS)
    
    # 대비 및 밝기 조정 (선택적)
    # enhancer = ImageEnhance.Contrast(image)
    # image = enhancer.enhance(1.5)
    
    return image

def extract_text_from_image(image_path: str) -> str:
    """이미지에서 텍스트 추출"""
    image = preprocess_image(image_path)
    
    # 다양한 언어를 지원하도록 설정 (한국어 + 영어)
    text = pytesseract.image_to_string(image, lang='kor+eng')
    
    return text

def extract_style_no(text: str) -> Optional[str]:
    """스타일 번호 추출"""
    # 스타일 번호 패턴 (예: TH2F7ASZ501ME, IL2P13AS201ZW 등)
    patterns = [
        r'STYLE\s*NO\.?\s*[:\.\s]\s*([A-Z0-9]{10,15})',
        r'스타일\s*번호\s*[:\.\s]\s*([A-Z0-9]{10,15})',
        r'([A-Z]{2,4}[0-9]{1,2}[A-Z]{1,4}[0-9]{3,6}[A-Z]{0,3})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None

def extract_color_size_matrix(text: str) -> List[Dict[str, Any]]:
    """색상 및 사이즈별 수량 매트릭스 추출"""
    # 결과를 저장할 리스트
    color_size_data = []
    
    # 색상 코드 패턴 (예: BK, WT, NV 등)
    color_pattern = r'([A-Z]{2,3})\s*\(([A-Z]{1,2})\)'
    
    # 사이즈 패턴 (예: 230, 235, 240, 245, 250)
    size_pattern = r'(2[23][05]|2[45][05]|2[67][05])'
    
    # 텍스트를 줄 단위로 분석
    lines = text.split('\n')
    current_color = None
    current_color_type = None
    
    for line in lines:
        # 색상 코드 및 타입 검색
        color_match = re.search(color_pattern, line)
        if color_match:
            current_color = color_match.group(1)
            current_color_type = color_match.group(2)
            continue
        
        # 현재 라인이 수량 정보를 포함하는지 확인
        if current_color and re.search(size_pattern, line):
            # 라인에서 숫자만 추출
            numbers = re.findall(r'\b\d+\b', line)
            
            # 수량 정보가 충분히 있는 경우
            if len(numbers) >= 6:  # 수량 + 5개 사이즈 정보
                total_qty = int(numbers[0]) if numbers else 0
                size_matrix = {}
                
                # 표준 사이즈
                standard_sizes = ["230", "235", "240", "245", "250"]
                
                # 사이즈별 수량 매핑
                for i, size in enumerate(standard_sizes):
                    if i + 1 < len(numbers):
                        size_matrix[size] = int(numbers[i + 1])
                
                # 데이터 추가
                color_data = {
                    "color_code": current_color,
                    "color_name": current_color,
                    "color_type": current_color_type,
                    "size_matrix": size_matrix,
                    "total_quantity": total_qty
                }
                color_size_data.append(color_data)
    
    return color_size_data

def extract_order_data(image_path: str) -> Dict[str, Any]:
    """작업지시서 이미지에서 주문 데이터 추출"""
    # 텍스트 추출
    text = extract_text_from_image(image_path)
    
    # 스타일 번호 추출
    style_no = extract_style_no(text)
    
    # 색상 및 사이즈 매트릭스 추출
    color_size_matrix = extract_color_size_matrix(text)
    
    # 추출된 데이터 반환
    extracted_data = {
        "style_no": style_no,
        "order_details": color_size_matrix,
        "raw_text": text  # 디버깅용 원본 텍스트
    }
    
    return extracted_data

# 테스트 함수
def test_image_extraction(image_path: str):
    """이미지 추출 테스트 및 결과 출력"""
    try:
        result = extract_order_data(image_path)
        print(f"스타일 번호: {result['style_no']}")
        print(f"주문 상세:")
        for detail in result['order_details']:
            print(f"  색상: {detail['color_code']} ({detail['color_type']})")
            print(f"  수량: {detail['total_quantity']}")
            print(f"  사이즈별 수량: {detail['size_matrix']}")
            print()
        
        print("원본 텍스트 (디버깅용):")
        print(result['raw_text'])
        
        return result
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return None