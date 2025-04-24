// OrderForm.jsx - 도식화/자수 이미지 업로드 + 상단 입력 필드 + 색상/사이즈 수량 동적 구성 (Chakra UI 기반)
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Button, Text, Flex, Input, Select, Table,
  Thead, Tbody, Tr, Td, Th, useToast, FormControl, FormLabel, Grid, GridItem, IconButton
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const OrderForm = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // 이미지 업로드 상태: 도식화(graphic), 자수(embroidery)
  const [imagePreview, setImagePreview] = useState({ graphic: null, embroidery: null });

  // 주문 폼의 상태 정의: 입력 필드 + 색상/사이즈/수량
  const [formData, setFormData] = useState({
    styleNo: '', customer: '', designer: '', manufacturer: '',
    quotedPrice: '', approvedPrice: '', deadline: '', jobNo: '', quantity: '',
    colors: [ { colorName: 'BK', colorCode: '#000000' } ],
    sizes: ['1', '2', '3', '4', '5'],
    quantities: {
      'BK': { '1': 11, '2': 21, '3': 28, '4': 18, '5': 12 }
    }
  });

// 발주량 자동 계산
  useEffect(() => {
    const totalQty = formData.colors.reduce((sum, color) => {
      return sum + formData.sizes.reduce((subSum, size) => {
        return subSum + (formData.quantities[color.colorName]?.[size] || 0);
      }, 0);
    }, 0);
    setFormData((prev) => ({ ...prev, quantity: totalQty }));
  }, [formData.colors, formData.sizes, formData.quantities]);


 // 🎨 색상명 또는 코드 변경 핸들러
  const handleColorChange = (colorIndex, field, value) => {
    const newColors = [...formData.colors];
    const oldName = newColors[colorIndex].colorName;
    const newColor = { ...newColors[colorIndex], [field]: value };
    newColors[colorIndex] = newColor;

    const newQuantities = { ...formData.quantities };
    if (field === 'colorName' && oldName !== value) {
      newQuantities[value] = newQuantities[oldName] || {};
      delete newQuantities[oldName];
    }

    setFormData((prev) => ({
      ...prev,
      colors: newColors,
      quantities: newQuantities
    }));
  };

   /// 일반 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


 /*  // 색상 이름/코드 변경
  const handleColorChange = (idx, key, value) => {
    const updatedColors = [...formData.colors];
    const oldName = updatedColors[idx].colorName;
    updatedColors[idx][key] = value;
    if (key === 'colorName' && oldName !== value) {
      const newQuantities = { ...formData.quantities };
      newQuantities[value] = newQuantities[oldName] || {};
      delete newQuantities[oldName];
      setFormData((prev) => ({ ...prev, colors: updatedColors, quantities: newQuantities }));
    } else {
      setFormData((prev) => ({ ...prev, colors: updatedColors }));
    }
  }; */

  // 사이즈명 변경
  const handleSizeChange = (idx, value) => {
    const updatedSizes = [...formData.sizes];
    const prevSize = updatedSizes[idx];
    updatedSizes[idx] = value;

    const updatedQuantities = { ...formData.quantities };
    Object.keys(updatedQuantities).forEach((color) => {
      const colorQuantities = updatedQuantities[color];
      if (colorQuantities[prevSize] !== undefined) {
        colorQuantities[value] = colorQuantities[prevSize];
        delete colorQuantities[prevSize];
      }
    });

    setFormData((prev) => ({ ...prev, sizes: updatedSizes, quantities: updatedQuantities }));
  };

  // 수량 입력 변경
  const handleQuantityChange = (color, size, value) => {
    const newQuantities = { ...formData.quantities };
    if (!newQuantities[color]) newQuantities[color] = {};
    newQuantities[color][size] = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, quantities: newQuantities }));
  };

  // 색상/사이즈 추가 핸들러
  const addColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { colorName: '', colorCode: '#000000' }]
    }));
  };

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, '']
    }));
  };

  // 이미지 파일 핸들러
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
// 발주량 자동 계산
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

   // 📊 컬러별 총 수량 계산
  const calculateColorTotal = (color) => {
    return formData.sizes.reduce((sum, size) => {
      return sum + (formData.quantities[color.colorName]?.[size] || 0);
    }, 0);
  };

  // 📊 사이즈별 총 수량 계산
  const calculateTotal = (size) => {
    return formData.colors.reduce((sum, color) => {
      return sum + (formData.quantities[color.colorName]?.[size] || 0);
    }, 0);
  };












  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.styleNo || !formData.customer) {
      toast({ title: '입력 오류', description: '스타일번호 및 고객사를 입력해주세요.', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // ------------------------ 렌더링 ------------------------

  return (
    <Box p={5} maxW="1200px" mx="auto">
      <Heading size="lg" mb={6}>신규 작업지시 등록</Heading>

      {/* 상단 입력 필드 (스타일, 생산처 등) */}
      <Grid templateColumns="repeat(5, 1fr)" gap={2} mb={6} borderWidth={1} borderRadius="md" p={4}>
        <GridItem colSpan={2}><FormControl><FormLabel>스타일 번호</FormLabel><Input name="styleNo" value={formData.styleNo} onChange={handleInputChange} /></FormControl></GridItem>
        <GridItem><FormControl><FormLabel>생산처</FormLabel><Input name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} /></FormControl></GridItem>
        <GridItem><FormControl><FormLabel>디자이너</FormLabel><Input name="designer" value={formData.designer} onChange={handleInputChange} /></FormControl></GridItem>
        <GridItem><FormControl><FormLabel>납기</FormLabel><Input name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} /></FormControl></GridItem>
        <GridItem colSpan={2}><FormControl><FormLabel>작지번호</FormLabel><Input name="jobNo" onChange={handleInputChange} /></FormControl></GridItem>
        <GridItem><FormControl><FormLabel>발주량</FormLabel><Input name="quantity"value={formData.quantity} readOnly  /></FormControl></GridItem>
        <GridItem><FormControl><FormLabel>견적 단가</FormLabel><Input name="quotedPrice" type="number" value={formData.quotedPrice} onChange={handleInputChange} /></FormControl></GridItem>
        <GridItem><FormControl><FormLabel>인정 단가</FormLabel><Input name="approvedPrice" type="number" value={formData.approvedPrice} onChange={handleInputChange} /></FormControl></GridItem>
      </Grid>

      {/* 이미지 업로드 */}
      <Flex gap={6} mb={6} direction={{ base: 'column', md: 'row' }}>
        {['graphic', 'embroidery'].map((type) => (
          <Box flex={1} borderWidth={1} borderRadius="md" p={5} key={type}>
            <Heading size="sm" mb={2}>{type === 'graphic' ? '도식화' : '자수'}</Heading>
            {!imagePreview[type] ? (
              <Box border="2px dashed" borderColor="gray.200" borderRadius="md" p={6} bg="gray.50" textAlign="center">
                <Text mb={2}>이미지를 드래그하거나 붙여넣기 하세요</Text>
                <input type="file" accept="image/*" id={`${type}-upload`} style={{ display: 'none' }} onChange={handleFileInput(type)} />
                <label htmlFor={`${type}-upload`}><Button as="span" colorScheme="blue">파일 선택</Button></label>
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




      {/* 색상/사이즈 매트릭스 입력 영역 */}
      <form onSubmit={handleSubmit}>
        <Box mb={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="bold">색상/사이즈 수량</Text>
            <Flex gap={2}>
              <Button size="sm" leftIcon={<AddIcon />} onClick={addColor}>색상 추가</Button>
              <Button size="sm" leftIcon={<AddIcon />} onClick={addSize}>사이즈 추가</Button>
            </Flex>
          </Flex>

          <Box overflowX="auto">
		  
		  
		  {/*테이블 색상지정*/}
            <Table
          size="sm"
          variant="simple"
          mt={6}
          sx={{
            th: { textAlign: 'center', bg: 'gray.100', color: 'gray.800' },
            td: { textAlign: 'center', verticalAlign: 'middle', bg: 'white', color: 'black' },
            'input': { backgroundColor: 'white' }
          }}
        >
			
			
			
              <Thead>
                <Tr>
                    <Th>컬러명</Th>
					  <Th>컬러 합</Th>
					  {formData.sizes.map((size, sIdx) => (
						<Th key={sIdx}>{size}</Th>
					  ))}
					</Tr>
				  </Thead>
				  <Tbody>
            {formData.colors.map((color, idx) => (
              <Tr key={idx}>
                <Td>
                  <Flex gap={2} align="center" justify="center">
                    <Input
                      size="xs"
                      value={color.colorName}
                      onChange={(e) => handleColorChange(idx, 'colorName', e.target.value)}
                      placeholder="컬러명"
                      textAlign="center"
                      bg="white"
                      color="black"
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                    <Input
                      size="xs"
                      type="color"
                      w="40px"
                      h="32px"
                      p={0}
                      value={color.colorCode}
                      onChange={(e) => handleColorChange(idx, 'colorCode', e.target.value)}
                    />
                  </Flex>
                </Td>
                <Td><strong>{calculateColorTotal(color)}</strong></Td>
                {formData.sizes.map((size) => (
                  <Td key={size}>
                    <Input
                      size="xs"
                      type="number"
                      textAlign="center"
                      value={formData.quantities[color.colorName]?.[size] || 0}
                      onChange={(e) => handleQuantityChange(color.colorName, size, e.target.value)}
                      bg="white"
                      color="black"
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                  </Td>
                ))}
              </Tr>
            ))}

            {/* 하단 사이즈별 합계 행 */}
            <Tr bg="gray.50">
              <Td colSpan={1}><strong>사이즈별 합계</strong></Td>
              <Td></Td>
              {formData.sizes.map((size, sIdx) => (
                <Td key={sIdx}><strong>{calculateTotal(size)}</strong></Td>
              ))}
            </Tr>
          </Tbody>
            </Table>
          </Box>
        </Box>

        {/* 제출 버튼 */}
        <Flex justify="flex-end" mt={6} gap={3}>
          <Button onClick={() => window.location.reload()}>취소</Button>
          <Button type="submit" colorScheme="blue" isLoading={loading} loadingText="저장 중...">작업지시 등록</Button>
        </Flex>
      </form>
    </Box>
  );
};

export default OrderForm;
