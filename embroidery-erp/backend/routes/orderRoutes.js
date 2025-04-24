// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');

// 작업지시서 API 라우트 정의
router.route('/')
  .get(orderController.getOrders)
  .post(orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrderById)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

// 작업지시서 상태 변경 API
router.route('/:id/status')
  .put(orderController.updateOrderStatus);

// 이미지 업로드 API
router.route('/upload-image')
  .post(orderController.uploadImage, orderController.processImageUpload);

module.exports = router;

// backend/server.js에 라우터 등록
/*
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 환경 변수 로드
dotenv.config();

// Express 앱 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 라우트 설정
app.use('/api/orders', require('./routes/orderRoutes'));

// 데이터베이스 연결
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 오류:', err));

// 서버 실행
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`));
*/