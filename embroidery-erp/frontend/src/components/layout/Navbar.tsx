// src/components/layout/Navbar.tsx
import React from 'react';
import { Box, Flex, Heading, Text, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  // 현재 날짜 포맷팅
  const formattedDate = new Date().toISOString().split('T')[0];
  
  return (
    <Box bg="blue.600" px={4} py={2} color="white">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="md">
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'white' }}>
            자수업체 ERP 시스템
          </RouterLink>
        </Heading>
        
        <HStack gap={2}>
          <Text fontWeight="medium">관리자</Text>
          <Text>|</Text>
          <Text>{formattedDate}</Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;