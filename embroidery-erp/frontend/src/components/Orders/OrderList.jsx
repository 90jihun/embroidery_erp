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
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  Badge
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
          <TableHeader>
            <TableRow>
              <TableColumnHeader>스타일 번호</TableColumnHeader>
              <TableColumnHeader>고객사</TableColumnHeader>
              <TableColumnHeader>디자이너</TableColumnHeader>
              <TableColumnHeader>생산처</TableColumnHeader>
              <TableColumnHeader isNumeric>견적단가</TableColumnHeader>
              <TableColumnHeader isNumeric>인정단가</TableColumnHeader>
              <TableColumnHeader isNumeric>총 수량</TableColumnHeader>
              <TableColumnHeader isNumeric>재단입고</TableColumnHeader>
              <TableColumnHeader isNumeric>자수완료</TableColumnHeader>
              <TableColumnHeader isNumeric>봉제출고</TableColumnHeader>
              <TableColumnHeader>등록일</TableColumnHeader>
              <TableColumnHeader>납기일</TableColumnHeader>
              <TableColumnHeader>상태</TableColumnHeader>
              <TableColumnHeader>액션</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>TH2F7ASZ501ME</TableCell>
              <TableCell>TIME HOMME</TableCell>
              <TableCell>김디자인</TableCell>
              <TableCell>세원봉제</TableCell>
              <TableCell isNumeric>1,500</TableCell>
              <TableCell isNumeric>1,350</TableCell>
              <TableCell isNumeric>90</TableCell>
              <TableCell isNumeric>90</TableCell>
              <TableCell isNumeric>45</TableCell>
              <TableCell isNumeric>0</TableCell>
              <TableCell>2025-04-20</TableCell>
              <TableCell>2025-04-30</TableCell>
              <TableCell>{getStatusBadge('진행중')}</TableCell>
              <TableCell>
                <Button size="xs" colorScheme="blue">상세</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>IL2P13AS201ZW</TableCell>
              <TableCell>HANDSOME</TableCell>
              <TableCell>이디자이너</TableCell>
              <TableCell>대한봉제</TableCell>
              <TableCell isNumeric>1,800</TableCell>
              <TableCell isNumeric>1,650</TableCell>
              <TableCell isNumeric>80</TableCell>
              <TableCell isNumeric>80</TableCell>
              <TableCell isNumeric>80</TableCell>
              <TableCell isNumeric>80</TableCell>
              <TableCell>2025-04-10</TableCell>
              <TableCell>2025-04-17</TableCell>
              <TableCell>{getStatusBadge('완료')}</TableCell>
              <TableCell>
                <Button size="xs" colorScheme="blue">상세</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>IL2P40495</TableCell>
              <TableCell>HANDSOME</TableCell>
              <TableCell>박디자인</TableCell>
              <TableCell>한솔봉제</TableCell>
              <TableCell isNumeric>2,000</TableCell>
              <TableCell isNumeric>1,800</TableCell>
              <TableCell isNumeric>74</TableCell>
              <TableCell isNumeric>0</TableCell>
              <TableCell isNumeric>0</TableCell>
              <TableCell isNumeric>0</TableCell>
              <TableCell>2025-04-22</TableCell>
              <TableCell>2025-04-28</TableCell>
              <TableCell>{getStatusBadge('대기중')}</TableCell>
              <TableCell>
                <Button size="xs" colorScheme="blue">상세</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default OrderList;