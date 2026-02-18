// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoginPromptModal from "./LoginPromptModal";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("userEmail");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 로그인이 안 되어 있고, 이번 세션에서 알림을 보여준 적이 없는 경우
    const hasShownAlert = sessionStorage.getItem("loginAlertShown");

    if (!isAuthenticated && !hasShownAlert) {
      setShowModal(true);
      // sessionStorage를 사용하여 브라우저 탭을 닫기 전까지는 다시 안 뜨게 설정
      sessionStorage.setItem("loginAlertShown", "true");
    }
  }, [isAuthenticated]);

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/", { replace: true }); // 확인 누르면 로그인 페이지로 이동
  };

  // 1. 인증된 사용자면 바로 페이지 보여줌
  if (isAuthenticated) {
    return children;
  }

  // 2. 인증 안 됐는데 모달도 이미 보여줬다면 즉시 리다이렉트
  if (!showModal && sessionStorage.getItem("loginAlertShown")) {
    return <Navigate to="/" replace />;
  }

  // 3. 모달을 보여줘야 하는 상태
  return (
    <>
      <LoginPromptModal isOpen={showModal} onClose={handleCloseModal} />
      {/* 배경이 비어있지 않게 로그인 페이지를 살짝 깔아두거나 빈 화면 유지 */}
      <div style={{ backgroundColor: "#f0f2f5", height: "100vh" }} />
    </>
  );
};

export default ProtectedRoute;
