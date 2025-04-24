// src/components/layout/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, Link, Flex } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: '작업지시 관리', path: '/orders' },
    { label: '생산 추적', path: '/production' },
    { label: '재고 관리', path: '/inventory' },
    { label: '디자인 관리', path: '/designs' },
    { label: '고객/업체 관리', path: '/customers' },
    { label: '보고서', path: '/reports' },
    { label: '설정', path: '/settings' },
  ];

  return (
    <Box
      as="nav"
      bg="gray.800"
      color="white"
      w="200px"
      h="100%"
      p={0}
      borderRight="1px solid"
      borderColor="gray.700"
    >
      <List spacing={0}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} bg={isActive ? 'gray.700' : 'transparent'}>
              <Link
                as={RouterLink}
                to={item.path}
                display="block"
                p={4}
                w="100%"
                fontWeight={isActive ? 'bold' : 'normal'}
                _hover={{ textDecoration: 'none', bg: 'gray.700' }}
                _activeLink={{ bg: 'gray.700', fontWeight: 'bold' }}
              >
                {item.label}
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
