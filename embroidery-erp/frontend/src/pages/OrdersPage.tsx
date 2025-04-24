// src/pages/OrdersPage.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import OrderForm from '../components/orders/OrderForm';
import OrderList from '../components/orders/OrderList';

const OrdersPage = () => {
  return (
    <Box p={5}>
      <Box mb={5}>
        <Heading size="lg">작업지시서</Heading>
        <Text color="gray.600">작업지시서 관리 페이지입니다.</Text>
      </Box>
      
      <OrderForm />
      <OrderList />
    </Box>
  );
};

export default OrdersPage;