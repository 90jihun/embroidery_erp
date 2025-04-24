// src/components/orders/OrderList.jsx
import React from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack
} from '@chakra-ui/react';

const OrderList = () => {
  // 상태별 배지 스타일
  const getStatusBadge = (status) => {
    switch (status) {
      case '대기중':
        return <Badge colorScheme="red" fontSize="0.8em">{status}</Badge>;
      case '진행중':
        return <Badge colorScheme="orange" fontSize="0.8em">{status}</Badge>;
      case '완료':
        return <Badge colorScheme="green" fontSize="0.8em">{status}</Badge>;
      default:
        return <Badge fontSize="0.8em">{status}</Badge>;
    }
  };

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="md" mb={5}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">최근 작업지시 목록</Heading>
        <Button size="sm">엑셀 다운로드</Button>
      </Flex>
      
      <Flex mb={4} gap={2}>
        <Select placeholder="모든 고객사" size="sm" w="180px">
          <option>TIME HOMME</option>
          <option>HANDSOME</option>
          <option>OEM 업체1</option>
        </Select>
        
        <Select placeholder="모든 상태" size="sm" w="180px">
          <option>대기중</option>
          <option>진행중</option>
          <option>완료</option>
        </Select>
        
        <Input placeholder="스타일번호 검색" size="sm" flexGrow={1} />
        <Button size="sm">검색</Button>
      </Flex>
      
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>스타일 번호</Th>
              <Th>고객사</Th>
              <Th>디자이너</Th>
              <Th>생산처</Th>
              <Th isNumeric>견적단가</Th>
              <Th isNumeric>인정단가</Th>
              <Th isNumeric>총 수량</Th>
              <Th isNumeric>재단입고</Th>
              <Th isNumeric>자수완료</Th>
              <Th isNumeric>봉제출고</Th>
              <Th>등록일</Th>
              <Th>납기일</Th>
              <Th>상태</Th>
              <Th>액션</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>TH2F7ASZ501ME</Td>
              <Td>TIME HOMME</Td>
              <Td>김디자인</Td>
              <Td>세원봉제</Td>
              <Td isNumeric>1,500</Td>
              <Td isNumeric>1,350</Td>
              <Td isNumeric>90</Td>
              <Td isNumeric>90</Td>
              <Td isNumeric>45</Td>
              <Td isNumeric>0</Td>
              <Td>2025-04-20</Td>
              <Td>2025-04-30</Td>
              <Td>{getStatusBadge('진행중')}</Td>
              <Td>
                <Button size="xs" colorScheme="blue">상세</Button>
              </Td>
            </Tr>
            <Tr>
              <Td>IL2P13AS201ZW</Td>
              <Td>HANDSOME</Td>
              <Td>이디자이너</Td>
              <Td>대한봉제</Td>
              <Td isNumeric>1,800</Td>
              <Td isNumeric>1,650</Td>
              <Td isNumeric>80</Td>
              <Td isNumeric>80</Td>
              <Td isNumeric>80</Td>
              <Td isNumeric>80</Td>
              <Td>2025-04-10</Td>
              <Td>2025-04-17</Td>
              <Td>{getStatusBadge('완료')}</Td>
              <Td>
                <Button size="xs" colorScheme="blue">상세</Button>
              </Td>
            </Tr>
            <Tr>
              <Td>IL2P40495</Td>
              <Td>HANDSOME</Td>
              <Td>박디자인</Td>
              <Td>한솔봉제</Td>
              <Td isNumeric>2,000</Td>
              <Td isNumeric>1,800</Td>
              <Td isNumeric>74</Td>
              <Td isNumeric>0</Td>
              <Td isNumeric>0</Td>
              <Td isNumeric>0</Td>
              <Td>2025-04-22</Td>
              <Td>2025-04-28</Td>
              <Td>{getStatusBadge('대기중')}</Td>
              <Td>
                <Button size="xs" colorScheme="blue">상세</Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default OrderList;