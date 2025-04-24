// src/components/layout/Navbar.tsx 수정
import React from 'react';
import { Box, Flex, Button, Heading, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <Box bg="blue.600" px={4} color="white">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading>
          <RouterLink to="/">자수업체 ERP</RouterLink>
        </Heading>
        
        <Stack direction={'row'} gap={4}>
          <Button colorScheme="blue" variant="solid">
            <RouterLink to="/orders">작업지시서</RouterLink>
          </Button>
          <Button colorScheme="blue" variant="solid">
            <RouterLink to="/customers">고객사</RouterLink>
          </Button>
          <Button colorScheme="blue" variant="solid">
            <RouterLink to="/production">생산관리</RouterLink>
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};

export default Navbar;