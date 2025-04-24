// OrderList.jsx - Chakra UI v2 기준 리팩토링
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
  Badge
} from '@chakra-ui/react';

const OrderList = () => {
  const getStatusBadge = (status) => {
    const colorMap = {
      '대기중': 'red',
      '진행중': 'orange',
      '완료': 'green'
    };
    return (
      <Badge colorScheme={colorMap[status] || 'gray'} fontSize="0.8em">
        {status}
      </Badge>
    );
  };

  return (
    <Box bg="white" p={5} borderRadius="md" boxShadow="md" mb={5}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">최근 작업지시 목록</Heading>
        <Button size="sm">엑셀 다운로드</Button>
      </Flex>

      <Flex mb={4} gap={2} flexWrap="wrap">
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
              {[
                '스타일 번호', '고객사', '디자이너', '생산처',
                '견적단가', '인정단가', '총 수량',
                '재단입고', '자수완료', '봉제출고',
                '등록일', '납기일', '상태', '액션'
              ].map((col, i) => (
                <Th key={i} isNumeric={[4,5,6,7,8,9].includes(i)}>{col}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {[{
              style: 'TH2F7ASZ501ME', brand: 'TIME HOMME', designer: '김디자인', vendor: '세원봉제',
              quote: 1500, final: 1350, qty: 90, cut: 90, emb: 45, sew: 0,
              created: '2025-04-20', due: '2025-04-30', status: '진행중'
            },{
              style: 'IL2P13AS201ZW', brand: 'HANDSOME', designer: '이디자이너', vendor: '대한봉제',
              quote: 1800, final: 1650, qty: 80, cut: 80, emb: 80, sew: 80,
              created: '2025-04-10', due: '2025-04-17', status: '완료'
            },{
              style: 'IL2P40495', brand: 'HANDSOME', designer: '박디자인', vendor: '한솔봉제',
              quote: 2000, final: 1800, qty: 74, cut: 0, emb: 0, sew: 0,
              created: '2025-04-22', due: '2025-04-28', status: '대기중'
            }].map((item, i) => (
              <Tr key={i}>
                <Td>{item.style}</Td>
                <Td>{item.brand}</Td>
                <Td>{item.designer}</Td>
                <Td>{item.vendor}</Td>
                <Td isNumeric>{item.quote.toLocaleString()}</Td>
                <Td isNumeric>{item.final.toLocaleString()}</Td>
                <Td isNumeric>{item.qty}</Td>
                <Td isNumeric>{item.cut}</Td>
                <Td isNumeric>{item.emb}</Td>
                <Td isNumeric>{item.sew}</Td>
                <Td>{item.created}</Td>
                <Td>{item.due}</Td>
                <Td>{getStatusBadge(item.status)}</Td>
                <Td>
                  <Button size="xs" colorScheme="blue">상세</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default OrderList;
