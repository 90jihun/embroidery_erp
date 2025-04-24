import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import './App.css';

// 임시 홈 페이지 컴포넌트
const Home = () => (
  <Box p={5}>
    <h1>자수업체 ERP 시스템</h1>
    <p>작업지시서 관리 및 생산 추적 시스템에 오신 것을 환영합니다.</p>
  </Box>
);

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh">
          <Navbar />
          <Box p={4}>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* 추후 더 많은 라우트 추가 예정 */}
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;