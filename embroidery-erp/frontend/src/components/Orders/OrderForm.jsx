// src/components/orders/OrderForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  Button,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  useToast
} from '@chakra-ui/react';

const OrderForm = () => {
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState(null);
  
  // 드래그 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleImageFile(file);
    }
  };
  
  // 이미지 파일 처리
  const handleImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // 파일 입력 처리
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };
  
  // 붙여넣기 이벤트 핸들러
  const handlePaste = (e) => {
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          handleImageFile(file);
          break;
        }
      }
    }
  };
  
  // 이미지 삭제
  const handleDeleteImage = () => {
    setImagePreview(null);
  };
  
  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "작업지시 등록 완료",
      description: "작업지시가 성공적으로 등록되었습니다.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  
  useEffect(() => {
    // 전역 붙여넣기 이벤트 리스너 등록
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);
  
  return (
    <Box p={5}>
      <Box bg="white" p={5} borderRadius="md" boxShadow="md" mb={5}>
        <Heading size="md" mb={4}>신규 작업지시 등록</Heading>
        
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">팁:</Text>
            <Text>
              작업지시서 이미지를 캡처(PrintScreen)하여 아래 영역에 붙여넣기(Ctrl+V)하면 자동으로 정보가 추출됩니다.
            </Text>
          </Box>
        </Alert>
        
        {!imagePreview ? (
          <Box
            border="2px dashed"
            borderColor="gray.200"
            borderRadius="md"
            p={10}
            bg="gray.50"
            textAlign="center"
            mb={4}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            _hover={{ borderColor: "blue.400", bg: "blue.50" }}
          >
            <Text fontSize="lg" mb={2}>작업지시서 이미지를 여기에 드래그하거나 붙여넣기 하세요</Text>
            <Text mb={3}>또는</Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button as="span" colorScheme="blue">파일 선택</Button>
            </label>
            <Text fontSize="sm" mt={2} color="gray.500">단축키: PrintScreen 후 Ctrl+V로 바로 붙여넣기</Text>
          </Box>
        ) : (
          <Box mb={4} textAlign="center">
            <Box maxH="300px" overflow="hidden" borderRadius="md" mb={2}>
              <img src={imagePreview} alt="작업지시서 미리보기" style={{ maxWidth: '100%' }} />
            </Box>
            <Button colorScheme="red" size="sm" onClick={handleDeleteImage}>이미지 삭제</Button>
          </Box>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>스타일 번호</FormLabel>
            <Input placeholder="예: TH2F7ASZ501ME" />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>고객사</FormLabel>
            <Select placeholder="선택하세요">
              <option value="1">TIME HOMME</option>
              <option value="2">HANDSOME</option>
              <option value="3">OEM 업체1</option>
            </Select>
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>디자이너</FormLabel>
            <Select placeholder="선택하세요">
              <option value="1">김디자인</option>
              <option value="2">이디자이너</option>
              <option value="3">박디자인</option>
            </Select>
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>생산처(봉제업체)</FormLabel>
            <Select placeholder="선택하세요">
              <option value="1">세원봉제</option>
              <option value="2">대한봉제</option>
              <option value="3">한솔봉제</option>
            </Select>
          </FormControl>
          
          <Flex gap={4} mb={4}>
            <FormControl flex={1}>
              <FormLabel>견적 단가 (원)</FormLabel>
              <Input type="number" placeholder="예: 1500" min={0} />
            </FormControl>
            <FormControl flex={1}>
              <FormLabel>인정 단가 (원)</FormLabel>
              <Input type="number" placeholder="예: 1400" min={0} />
            </FormControl>
          </Flex>
          
          <FormControl mb={4}>
            <FormLabel>납기일</FormLabel>
            <Input type="date" />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>색상/사이즈별 수량 매트릭스</FormLabel>
            <Flex mb={3} gap={2}>
              <Button size="sm" colorScheme="blue">+ 색상 추가</Button>
              <Button size="sm" colorScheme="blue">+ 사이즈 추가</Button>
            </Flex>
            
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>COLOR<br/>NO.</TableColumnHeader>
                    <TableColumnHeader>수량</TableColumnHeader>
                    <TableColumnHeader>230</TableColumnHeader>
                    <TableColumnHeader>235</TableColumnHeader>
                    <TableColumnHeader>240</TableColumnHeader>
                    <TableColumnHeader>245</TableColumnHeader>
                    <TableColumnHeader>250</TableColumnHeader>
                    <TableColumnHeader>기타</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Flex align="center">
                        <Box w="20px" h="20px" bg="black" mr={2} border="1px" borderColor="gray.300"></Box>
                        <Text>BK (P)</Text>
                      </Flex>
                    </TableCell>
                    <TableCell>130-90</TableCell>
                    <TableCell><Input type="number" size="xs" defaultValue={11} textAlign="center" w="50px" /></TableCell>
                    <TableCell><Input type="number" size="xs" defaultValue={21} textAlign="center" w="50px" /></TableCell>
                    <TableCell><Input type="number" size="xs" defaultValue={28} textAlign="center" w="50px" /></TableCell>
                    <TableCell><Input type="number" size="xs" defaultValue={18} textAlign="center" w="50px" /></TableCell>
                    <TableCell><Input type="number" size="xs" defaultValue={12} textAlign="center" w="50px" /></TableCell>
                    <TableCell><Input type="number" size="xs" defaultValue={0} textAlign="center" w="50px" /></TableCell>
                  </TableRow>
                  {/* 필요한 만큼 행 추가 */}
                  <TableRow bg="gray.50">
                    <TableCell colSpan={2} textAlign="right"><strong>합계:</strong></TableCell>
                    <TableCell><strong>48</strong></TableCell>
                    <TableCell><strong>88</strong></TableCell>
                    <TableCell><strong>119</strong></TableCell>
                    <TableCell><strong>74</strong></TableCell>
                    <TableCell><strong>51</strong></TableCell>
                    <TableCell><strong>0</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </FormControl>
          
          <Flex justify="flex-end" mt={6}>
            <Button mr={3}>취소</Button>
            <Button type="submit" colorScheme="blue">작업지시 등록</Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default OrderForm;