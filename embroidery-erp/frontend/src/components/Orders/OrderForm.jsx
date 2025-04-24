// OrderForm.jsx - 도식화/자수 이미지 업로드 분리 UI 리팩토링 (Chakra UI 기반)
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Alert, AlertIcon, Button, Text, Flex, Input, Select, Table,
  Thead, Tbody, Tr, Td, Th, useToast, FormControl, FormLabel
} from '@chakra-ui/react';

const OrderForm = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState({ graphic: null, embroidery: null });

  const [formData, setFormData] = useState({
    styleNo: '', customer: '', designer: '', manufacturer: '',
    quotedPrice: '', approvedPrice: '', deadline: '',
    colorSizeMatrix: [
      { colorName: 'BK (P)', colorCode: '#000000', quantity: '130-90', sizes: { '230': 11, '235': 21, '240': 28, '245': 18, '250': 12, 'etc': 0 } }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeQuantityChange = (colorIndex, size, value) => {
    const newMatrix = [...formData.colorSizeMatrix];
    newMatrix[colorIndex].sizes[size] = parseInt(value) || 0;
    setFormData({ ...formData, colorSizeMatrix: newMatrix });
  };

  const calculateTotal = (size) => formData.colorSizeMatrix.reduce((sum, color) => sum + (color.sizes[size] || 0), 0);

  const handleImageFile = (type, file) => {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview((prev) => ({ ...prev, [type]: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleFileInput = (type) => (e) => {
    if (e.target.files && e.target.files[0]) handleImageFile(type, e.target.files[0]);
  };

  const handlePaste = (e) => {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const file = e.clipboardData.items[i].getAsFile();
      if (e.clipboardData.items[i].type.includes('image')) {
        setImagePreview((prev) => ({ ...prev, embroidery: URL.createObjectURL(file) }));
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.styleNo || !formData.customer) {
      toast({ title: '입력 오류', description: '스타일번호 및 고객사를 입력해주세요.', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageGraphic: imagePreview.graphic, imageEmbroidery: imagePreview.embroidery })
      });
      if (!response.ok) throw new Error('서버 오류 발생');
      toast({ title: '등록 완료', status: 'success', duration: 5000, isClosable: true });
    } catch (err) {
      toast({ title: '등록 실패', description: err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} maxW="1200px" mx="auto">
      <Heading size="lg" mb={6}>신규 작업지시 등록</Heading>

      <Flex gap={6} mb={6} direction={{ base: 'column', md: 'row' }}>
        {['graphic', 'embroidery'].map((type) => (
          <Box flex={1} borderWidth={1} borderRadius="md" p={5} key={type}>
            <Heading size="sm" mb={2}>{type === 'graphic' ? '도식화' : '자수'}</Heading>
            {!imagePreview[type] ? (
              <Box border="2px dashed" borderColor="gray.200" borderRadius="md" p={6} bg="gray.50" textAlign="center">
                <Text mb={2}>이미지를 드래그하거나 붙여넣기 하세요</Text>
                <input type="file" accept="image/*" id={`${type}-upload`} style={{ display: 'none' }} onChange={handleFileInput(type)} />
                <label htmlFor={`${type}-upload`}><Button as="span" colorScheme="blue">파일 선택</Button></label>
                <Text fontSize="sm" mt={2} color="gray.500">PrintScreen 후 붙여넣기</Text>
              </Box>
            ) : (
              <Box textAlign="center">
                <img src={imagePreview[type]} alt={`${type} preview`} style={{ maxHeight: '250px', margin: '0 auto' }} />
                <Button size="sm" mt={2} colorScheme="red" onClick={() => setImagePreview((prev) => ({ ...prev, [type]: null }))}>삭제</Button>
              </Box>
            )}
          </Box>
        ))}
      </Flex>

      <form onSubmit={handleSubmit}>
        <FormControl mb={4}><FormLabel>스타일 번호</FormLabel><Input name="styleNo" value={formData.styleNo} onChange={handleInputChange} /></FormControl>
        <FormControl mb={4}><FormLabel>고객사</FormLabel><Select name="customer" value={formData.customer} onChange={handleInputChange} placeholder="선택하세요"><option value="TIME HOMME">TIME HOMME</option><option value="HANDSOME">HANDSOME</option></Select></FormControl>

        <Flex gap={4} mb={4}>
          <FormControl><FormLabel>견적 단가</FormLabel><Input name="quotedPrice" type="number" value={formData.quotedPrice} onChange={handleInputChange} /></FormControl>
          <FormControl><FormLabel>인정 단가</FormLabel><Input name="approvedPrice" type="number" value={formData.approvedPrice} onChange={handleInputChange} /></FormControl>
        </Flex>

        <FormControl mb={4}><FormLabel>납기일</FormLabel><Input name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} /></FormControl>

        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>색상/사이즈 수량</Text>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead><Tr><Th>Color</Th><Th>Qty</Th>{['230','235','240','245','250','etc'].map(size => (<Th key={size}>{size}</Th>))}</Tr></Thead>
              <Tbody>
                {formData.colorSizeMatrix.map((color, idx) => (
                  <Tr key={idx}>
                    <Td><Flex align="center"><Box w="20px" h="20px" bg={color.colorCode} mr={2} border="1px solid gray" /><Text>{color.colorName}</Text></Flex></Td>
                    <Td>{color.quantity}</Td>
                    {['230','235','240','245','250','etc'].map(size => (
                      <Td key={size}><Input size="xs" type="number" value={color.sizes[size]} onChange={(e) => handleSizeQuantityChange(idx, size, e.target.value)} textAlign="center" w="50px" /></Td>
                    ))}
                  </Tr>
                ))}
                <Tr bg="gray.50">
                  <Td colSpan={2} textAlign="right"><strong>합계</strong></Td>
                  {['230','235','240','245','250','etc'].map(size => (<Td key={size}><strong>{calculateTotal(size)}</strong></Td>))}
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Flex justify="flex-end" mt={6} gap={3}>
          <Button onClick={() => window.location.reload()}>취소</Button>
          <Button type="submit" colorScheme="blue" isLoading={loading} loadingText="저장 중...">작업지시 등록</Button>
        </Flex>
      </form>
    </Box>
  );
};

export default OrderForm;
