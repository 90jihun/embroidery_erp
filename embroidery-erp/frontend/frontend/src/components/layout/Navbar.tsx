import React from 'react';
import { Box, Flex, Heading, Button, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <Box bg="blue.600" px={4} color="white">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading as={RouterLink} to="/" size="lg" fontWeight="bold">
          자수업체 ERP
        </Heading>
        
        <HStack spacing={4}>
          <Button as={RouterLink} to="/orders" colorScheme="blue" variant="solid">
            작업지시서
          </Button>
          <Button as={RouterLink} to="/customers" colorScheme="blue" variant="solid">
            고객사
          </Button>
          <Button as={RouterLink} to="/production" colorScheme="blue" variant="solid">
            생산관리
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;