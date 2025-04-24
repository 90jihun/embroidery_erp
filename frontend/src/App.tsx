// src/App.tsx - Chakra UI v3용 수정 버전
import React from 'react';
import { ChakraProvider, Box, createSystem, defaultConfig } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Routes from './Routes';

// v3에서는 createSystem을 사용하여 시스템 객체 생성
const system = createSystem(defaultConfig);

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
