
// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // 기본 정보
  styleNo: {
    type: String,
    required: [true, '스타일 번호는 필수 입력 사항입니다.'],
    trim: true
  },
  customer: {
    type: String,
    required: [true, '고객사는 필수 입력 사항입니다.'],
    trim: true
  },
  designer: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  
  // 가격 정보
  quotedPrice: {
    type: Number,
    default: 0
  },
  approvedPrice: {
    type: Number,
    default: 0
  },
  
  // 날짜 정보
  registeredDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date
  },
  cuttingInDate: {
    type: Date
  },
  embroideryDoneDate: {
    type: Date
  },
  sewingOutDate: {
    type: Date
  },
  
  // 색상/사이즈 매트릭스
  colorSizeMatrix: [{
    colorName: String,
    colorCode: String,
    quantity: String,
    sizes: {
      type: Map,
      of: Number
    }
  }],
  
  // 수량 합계
  totalQuantity: {
    type: Number,
    default: 0
  },
  
  // 이미지 경로
  image: {
    type: String
  },
  
  // 상태 정보
  status: {
    type: String,
    enum: ['대기중', '진행중', '완료'],
    default: '대기중'
  },
  
  // 메타 데이터
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 상태 변경에 따른 날짜 자동 설정
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case '진행중':
        if (!this.cuttingInDate) {
          this.cuttingInDate = now;
        }
        break;
      case '완료':
        if (!this.sewingOutDate) {
          this.sewingOutDate = now;
        }
        break;
    }
  }
  
  next();
});

// 가상 필드: 생산 진행률
OrderSchema.virtual('progress').get(function() {
  let progress = 0;
  
  if (this.cuttingInDate) {
    progress += 30; // 재단 입고 시 30% 진행
  }
  
  if (this.embroideryDoneDate) {
    progress += 40; // 자수 완료 시 70%까지 진행
  }
  
  if (this.sewingOutDate) {
    progress += 30; // 봉제 출고 시 100% 완료
  }
  
  return progress;
});

// 가상 필드: 남은 일수
OrderSchema.virtual('daysRemaining').get(function() {
  if (!this.deadline) {
    return null;
  }
  
  const today = new Date();
  const deadline = new Date(this.deadline);
  
  // 날짜 차이 계산 (밀리초 -> 일)
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

module.exports = mongoose.model('Order', OrderSchema);