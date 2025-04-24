// src/App.tsx
import React from 'react';
import { ChakraProvider, Box, Flex, createSystem, defaultConfig } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Routes from './Routes';

// v3 방식으로 시스템 생성
const system = createSystem(defaultConfig);

function App() {
  return (
    <ChakraProvider value={system}>
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