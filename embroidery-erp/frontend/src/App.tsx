// src/App.tsx - 가장 단순한 버전
import React from 'react';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Routes from './Routes';

// 테마 확장
const theme = extendTheme({});

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