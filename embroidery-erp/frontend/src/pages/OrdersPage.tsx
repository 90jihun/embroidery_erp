// src/pages/OrdersPage.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import OrderForm from '../components/orders/OrderForm';
import OrderList from '../components/orders/OrderList';

const OrdersPage = () => {
  return (
    <Box p={6}>
      <Box mb={6}>
        <Heading size="lg" mb={1}>작업지시서</Heading>
        <Text fontSize="md" color="gray.500">
          작업지시서 관리 페이지입니다.
        </Text>
      </Box>

      <OrderForm />
      <Box mt={8}>
        <OrderList />
      </Box>
    </Box>
  );
};

export default OrdersPage;
