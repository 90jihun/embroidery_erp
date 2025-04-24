// src/Routes.tsx
import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import OrdersPage from './pages/OrdersPage';

// 페이지 컴포넌트들 (나중에 실제 컴포넌트로 대체)
const HomePage = () => (
  <Box p={5}>
    <h1>자수업체 ERP 시스템</h1>
    <p>환영합니다! 상단 메뉴에서 원하는 기능을 선택하세요.</p>
  </Box>
);

const CustomersPage = () => (
  <Box p={5}>
    <h1>고객사</h1>
    <p>고객사 관리 페이지입니다.</p>
  </Box>
);

const ProductionPage = () => (
  <Box p={5}>
    <h1>생산관리</h1>
    <p>생산관리 페이지입니다.</p>
  </Box>
);

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/production" element={<ProductionPage />} />
    </RouterRoutes>
  );
};

export default Routes;