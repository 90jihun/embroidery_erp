// src/services/OrderService.js
// 작업지시서 관련 API 호출을 담당하는 서비스 클래스

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class OrderService {
  /**
   * 작업지시서 등록 API 호출
   * @param {Object} orderData - 작업지시서 데이터
   * @returns {Promise<Object>} - API 응답 결과
   */
  static async createOrder(orderData) {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  /**
   * 작업지시서 목록 조회 API 호출
   * @param {Object} params - 검색 및 필터링 매개변수
   * @returns {Promise<Array>} - 작업지시서 목록
   */
  static async getOrders(params = {}) {
    try {
      // URL 검색 파라미터 구성
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${API_URL}/orders?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  /**
   * 작업지시서 상세 조회 API 호출
   * @param {string} id - 작업지시서 ID
   * @returns {Promise<Object>} - 작업지시서 상세 정보
   */
  static async getOrderById(id) {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error(`Get order by ID ${id} error:`, error);
      throw error;
    }
  }

  /**
   * 작업지시서 수정 API 호출
   * @param {string} id - 작업지시서 ID
   * @param {Object} orderData - 수정할 작업지시서 데이터
   * @returns {Promise<Object>} - 수정된 작업지시서 정보
   */
  static async updateOrder(id, orderData) {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error(`Update order ${id} error:`, error);
      throw error;
    }
  }

  /**
   * 작업지시서 삭제 API 호출
   * @param {string} id - 작업지시서 ID
   * @returns {Promise<Object>} - 삭제 결과
   */
  static async deleteOrder(id) {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error(`Delete order ${id} error:`, error);
      throw error;
    }
  }
}

export default OrderService;