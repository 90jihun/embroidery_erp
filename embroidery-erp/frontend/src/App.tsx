// src/App.tsx 수정
import React from 'react';
import { ChakraProvider, theme, Box } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Routes from './Routes'; // 라우트 정의 컴포넌트가 있다고 가정

function App() {
  return (
    <ChakraProvider theme={theme}>
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