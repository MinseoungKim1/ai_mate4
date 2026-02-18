import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 로그인 함수
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      // 성공 시 데이터 반환
      return { success: true, data: res.data };
    } catch (error) {
      // 💡 핵심: 여기서 에러를 가로채서(catch) 객체로 리턴해줘야 합니다.
      console.error("Login API Error:", error);

      return {
        success: false,
        // 백엔드에서 보낸 "이메일 또는 비밀번호가 틀렸습니다." 메시지 추출
        message:
          error.response?.data?.message || "서버 통신 오류가 발생했습니다.",
      };
    }
  };

  // 내 정보 불러오기 (마이페이지 등에서 사용)
  const getProfile = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/auth/me");
      setUser(response.data);
    } catch (err) {
      console.error("인증되지 않은 사용자입니다.");
    }
  };

  return { user, login, getProfile, loading };
};
