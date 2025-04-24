// src/App.tsx - 커스텀 테마가 필요한 경우
import React from 'react';
import { ChakraProvider, Box, createSystem, defaultConfig } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Routes from './Routes';

// 커스텀 설정
const config = {
  ...defaultConfig,
  components: {
    // 커스텀 컴포넌트 스타일
    Button: {
      baseStyle: {
        fontWeight: 'bold',
      },
    },
  },
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary: {
        500: '#3182CE', // 기본 파란색
      },
    },
  },
};

// 시스템 생성
const system = createSystem(config);

function App() {
  return (
    <ChakraProvider value={system}>
      <Router>
        <Box minH="100vh">
          <Navbar />
          <Routes />
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
