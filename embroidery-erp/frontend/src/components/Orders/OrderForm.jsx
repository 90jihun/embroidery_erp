// OrderForm.jsx - Chakra UI v3 스타일 리팩토링
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Alert, AlertIcon, Button, Text, Flex, Input, Select, Table,
  TableHeader, TableBody, TableRow, TableCell, TableColumnHeader, useToast,
  Field, FieldLabel, FieldControl, FieldError
} from '@chakra-ui/react';

const OrderForm = () => {
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState(null);

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        handleImageFile(file);
        break;
      }
    }
  };

  const handleDeleteImage = () => setImagePreview(null);

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
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
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
            _hover={{ borderColor: "blue.400", bg: "blue.50" }}>
            <Text fontSize="lg" mb={2}>작업지시서 이미지를 여기에 드래그하거나 붙여넣기 하세요</Text>
            <Text mb={3}>또는</Text>
            <input type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} id="image-upload" />
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
          {["스타일 번호", "고객사", "디자이너", "생산처(봉제업체)"].map((label, index) => (
            <Field key={index} mb={4}>
              <FieldLabel>{label}</FieldLabel>
              <FieldControl>
                <Input placeholder={`예: ${label}`} />
              </FieldControl>
              <FieldError />
            </Field>
          ))}

          <Flex gap={4} mb={4}>
            {["견적 단가 (원)", "인정 단가 (원)"].map((label, index) => (
              <Field key={index} flex={1}>
                <FieldLabel>{label}</FieldLabel>
                <FieldControl>
                  <Input type="number" min={0} placeholder={`예: ${label.includes('견적') ? 1500 : 1400}`} />
                </FieldControl>
                <FieldError />
              </Field>
            ))}
          </Flex>

          <Field mb={4}>
            <FieldLabel>납기일</FieldLabel>
            <FieldControl>
              <Input type="date" />
            </FieldControl>
            <FieldError />
          </Field>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>색상/사이즈별 수량 매트릭스</Text>
            <Flex mb={3} gap={2}>
              <Button size="sm" colorScheme="blue">+ 색상 추가</Button>
              <Button size="sm" colorScheme="blue">+ 사이즈 추가</Button>
            </Flex>
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <TableHeader>
                  <TableRow>
                    {['COLOR NO.', '수량', '230', '235', '240', '245', '250', '기타'].map((col, i) => (
                      <TableColumnHeader key={i}>{col}</TableColumnHeader>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Flex align="center">
                        <Box w="20px" h="20px" bg="black" mr={2} border="1px" borderColor="gray.300" />
                        <Text>BK (P)</Text>
                      </Flex>
                    </TableCell>
                    <TableCell>130-90</TableCell>
                    {[11, 21, 28, 18, 12, 0].map((val, i) => (
                      <TableCell key={i}><Input type="number" size="xs" defaultValue={val} textAlign="center" w="50px" /></TableCell>
                    ))}
                  </TableRow>
                  <TableRow bg="gray.50">
                    <TableCell colSpan={2} textAlign="right"><strong>합계:</strong></TableCell>
                    {[48, 88, 119, 74, 51, 0].map((val, i) => (
                      <TableCell key={i}><strong>{val}</strong></TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Flex justify="flex-end" mt={6} gap={2}>
            <Button>취소</Button>
            <Button type="submit" colorScheme="blue">작업지시 등록</Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default OrderForm;
