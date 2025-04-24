// src/components/layout/Navbar.tsx
import React from 'react';
import { Box, Flex, Heading, Text, HStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  const formattedDate = new Date().toISOString().split('T')[0];

  return (
    <Box bg="blue.600" px={4} py={2} color="white">
      <Flex align="center" justify="space-between">
        <Heading size="md">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} color="white">
            자수업체 ERP 시스템
          </Link>
        </Heading>

        <HStack spacing={3}>
          <Text fontWeight="medium">관리자</Text>
          <Text>|</Text>
          <Text>{formattedDate}</Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
