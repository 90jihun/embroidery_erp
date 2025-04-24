// backend/controllers/OrderController.js
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  }
});

// 작업지시서 생성
exports.createOrder = async (req, res) => {
  try {
    // 이미지 데이터가 base64 문자열로 전송된 경우
    let imagePath = null;
    if (req.body.image) {
      // base64 문자열에서 이미지 데이터 추출
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `order-${Date.now()}.png`;
      const uploadDir = path.join(__dirname, '../uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      imagePath = path.join(uploadDir, filename);
      fs.writeFileSync(imagePath, buffer);
      
      // 경로를 상대 경로로 변환하여 저장
      imagePath = `/uploads/${filename}`;
    }

    // 작업지시서 데이터 생성
    const orderData = {
      styleNo: req.body.styleNo,
      customer: req.body.customer,
      designer: req.body.designer,
      manufacturer: req.body.manufacturer,
      quotedPrice: req.body.quotedPrice,
      approvedPrice: req.body.approvedPrice,
      deadline: req.body.deadline,
      colorSizeMatrix: req.body.colorSizeMatrix,
      totalQuantity: req.body.totalQuantity || 0,
      image: imagePath,
      status: req.body.status || '대기중',
      registeredDate: req.body.registeredDate || new Date().toISOString().split('T')[0],
      cuttingInDate: null,
      embroideryDoneDate: null,
      sewingOutDate: null
    };

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('작업지시서 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 작업지시서 목록 조회
exports.getOrders = async (req, res) => {
  try {
    const { customer, status, styleNo, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // 필터 조건 구성
    const query = {};
    
    if (customer) {
      query.customer = customer;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (styleNo) {
      query.styleNo = { $regex: styleNo, $options: 'i' }; // 부분 일치 검색
    }
    
    // 날짜 범위 검색
    if (startDate || endDate) {
      query.registeredDate = {};
      
      if (startDate) {
        query.registeredDate.$gte = startDate;
      }
      
      if (endDate) {
        query.registeredDate.$lte = endDate;
      }
    }
    
    // 페이징 처리
    const skip = (page - 1) * limit;
    
    // 작업지시서 조회
    const orders = await Order.find(query)
      .sort({ registeredDate: -1 }) // 최신순 정렬
      .skip(skip)
      .limit(parseInt(limit));
    
    // 전체 개수 조회
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('작업지시서 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 작업지시서 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '해당 작업지시서를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('작업지시서 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 작업지시서 수정
exports.updateOrder = async (req, res) => {
  try {
    // 이미지 처리
    let imagePath = req.body.image;
    
    // 새로운 이미지가 base64 문자열로 전송된 경우 (기존 이미지와 다른 경우)
    if (req.body.image && req.body.image.startsWith('data:image')) {
      // base64 문자열에서 이미지 데이터 추출
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `order-${Date.now()}.png`;
      const uploadDir = path.join(__dirname, '../uploads');
      
      // 디렉토리가 없으면 생성
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fullPath = path.join(uploadDir, filename);
      fs.writeFileSync(fullPath, buffer);
      
      // 경로를 상대 경로로 변환하여 저장
      imagePath = `/uploads/${filename}`;
      
      // 기존 이미지 삭제
      const order = await Order.findById(req.params.id);
      if (order && order.image && !order.image.startsWith('data:image')) {
        const oldImagePath = path.join(__dirname, '..', order.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // 작업지시서 데이터 업데이트
    const orderData = {
      styleNo: req.body.styleNo,
      customer: req.body.customer,
      designer: req.body.designer,
      manufacturer: req.body.manufacturer,
      quotedPrice: req.body.quotedPrice,
      approvedPrice: req.body.approvedPrice,
      deadline: req.body.deadline,
      colorSizeMatrix: req.body.colorSizeMatrix,
      totalQuantity: req.body.totalQuantity || 0,
      image: imagePath,
      status: req.body.status,
      cuttingInDate: req.body.cuttingInDate,
      embroideryDoneDate: req.body.embroideryDoneDate,
      sewingOutDate: req.body.sewingOutDate
    };

    const order = await Order.findByIdAndUpdate(req.params.id, orderData, {
      new: true,
      runValidators: true
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '해당 작업지시서를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('작업지시서 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 작업지시서 삭제
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '해당 작업지시서를 찾을 수 없습니다.'
      });
    }
    
    // 이미지 파일 삭제
    if (order.image && !order.image.startsWith('data:image')) {
      const imagePath = path.join(__dirname, '..', order.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await order.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('작업지시서 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 작업지시서 상태 변경
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cuttingInDate, embroideryDoneDate, sewingOutDate } = req.body;
    
    // 작업지시서 상태 업데이트
    const updateData = { status };
    
    // 각 상태별 날짜 필드 업데이트
    if (cuttingInDate) {
      updateData.cuttingInDate = cuttingInDate;
    }
    
    if (embroideryDoneDate) {
      updateData.embroideryDoneDate = embroideryDoneDate;
    }
    
    if (sewingOutDate) {
      updateData.sewingOutDate = sewingOutDate;
    }
    
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '해당 작업지시서를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('작업지시서 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 파일 업로드 미들웨어
exports.uploadImage = upload.single('image');

// 이미지 업로드 처리
exports.processImageUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 없습니다.'
      });
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        imagePath
      }
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};