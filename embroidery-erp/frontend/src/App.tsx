// src/App.tsx
import React from 'react';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Routes from './Routes';

function App() {
  return (
    <ChakraProvider>
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
