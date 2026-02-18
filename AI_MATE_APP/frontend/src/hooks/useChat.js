import { useState } from 'react';
import axios from 'axios';

export const useChat = () => {
  const [loading, setLoading] = useState(false);

  // 메시지 전송 및 AI 답변 받기
  const sendMessage = async (message) => {
    setLoading(true);
    try {
      // Express 서버(포트 3000번 가정)로 메시지 전송
      const response = await axios.post('http://localhost:3000/api/chat', {
        message: message,
      });
      return response.data; // 서버에서 준 AI의 답장 { aiText: "..." }
    } catch (error) {
      console.error("데이터 통신 에러:", error);
      return { aiText: "서버가 아파요.. 나중에 다시 대화해요!" };
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};