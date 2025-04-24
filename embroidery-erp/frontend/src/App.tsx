// src/App.tsx
import React from 'react';
import { ChakraProvider, Box, Flex, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Routes from './Routes';

// 테마 확장 (기본 색상 및 스타일 설정)
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Flex direction="column" h="100vh">
          <Navbar />
          <Flex flex="1" overflow="hidden">
            <Sidebar />
            <Box flex="1" overflowY="auto" bg="gray.50">
              <Routes />
            </Box>
          </Flex>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

export default App;