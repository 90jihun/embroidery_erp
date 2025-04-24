// src/components/orders/OrderForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Flex,
  NumberInput,
  NumberInputField,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  Center,
  Text,
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
  
  React.useEffect(() => {
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
            <AlertTitle>팁:</AlertTitle>
            <AlertDescription>
              작업지시서 이미지를 캡처(PrintScreen)하여 아래 영역에 붙여넣기(Ctrl+V)하면 자동으로 정보가 추출됩니다.
            </AlertDescription>
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
              <NumberInput min={0}>
                <NumberInputField placeholder="예: 1500" />
              </NumberInput>
            </FormControl>
            <FormControl flex={1}>
              <FormLabel>인정 단가 (원)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField placeholder="예: 1400" />
              </NumberInput>
            </FormControl>
          </Flex>
          
          <FormControl mb={4}>
            <FormLabel>납기일</FormLabel>
            <Input type="date" />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>색상/사이즈별 수량 매트릭스</FormLabel>
            <HStack mb={3}>
              <Button size="sm" colorScheme="blue">+ 색상 추가</Button>
              <Button size="sm" colorScheme="blue">+ 사이즈 추가</Button>
            </HStack>
            
            <Box overflowX="auto">
              <Table variant="simple" size="sm" border="1px" borderColor="gray.200">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>COLOR<br/>NO.</Th>
                    <Th>수량</Th>
                    <Th>230</Th>
                    <Th>235</Th>
                    <Th>240</Th>
                    <Th>245</Th>
                    <Th>250</Th>
                    <Th>기타</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>
                      <Flex align="center">
                        <Box w="20px" h="20px" bg="black" mr={2} border="1px" borderColor="gray.300"></Box>
                        <Text>BK (P)</Text>
                      </Flex>
                    </Td>
                    <Td>130-90</Td>
                    <Td><Input type="number" size="xs" defaultValue={11} textAlign="center" w="50px" /></Td>
                    <Td><Input type="number" size="xs" defaultValue={21} textAlign="center" w="50px" /></Td>
                    <Td><Input type="number" size="xs" defaultValue={28} textAlign="center" w="50px" /></Td>
                    <Td><Input type="number" size="xs" defaultValue={18} textAlign="center" w="50px" /></Td>
                    <Td><Input type="number" size="xs" defaultValue={12} textAlign="center" w="50px" /></Td>
                    <Td><Input type="number" size="xs" defaultValue={0} textAlign="center" w="50px" /></Td>
                  </Tr>
                  {/* 필요한 만큼 행 추가 */}
                  <Tr bg="gray.50">
                    <Td colSpan={2} textAlign="right"><strong>합계:</strong></Td>
                    <Td><strong>48</strong></Td>
                    <Td><strong>88</strong></Td>
                    <Td><strong>119</strong></Td>
                    <Td><strong>74</strong></Td>
                    <Td><strong>51</strong></Td>
                    <Td><strong>0</strong></Td>
                  </Tr>
                </Tbody>
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