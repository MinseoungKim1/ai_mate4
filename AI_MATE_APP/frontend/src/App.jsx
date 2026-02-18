import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // 애니메이션용
import Login from "./pages/Login";
import Home from "./pages/MainHome";
import IdealSelect from "./pages/IndealSelect";
import ChatRoom from "./pages/ChatRoom";
import Payment from "./pages/Payment";
import History from "./pages/History";
import MyPage from "./pages/MyPage";
import Analyze from "./pages/Analyze";
import HistoryChatRoom from "./pages/HistoryChatroom";
import AiChatRoom from "./pages/AiChatRoom";
import PaymentSuccess from "./pages/PaymentSuccess";
/**
 * 🔒 로그인 권한 확인 및 커스텀 팝업 제어 컴포넌트
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("userEmail");

  // sessionStorage를 확인하여 이번 세션에 경고창을 보여줬는지 체크
  const hasShownAlert = sessionStorage.getItem("loginAlertShown");

  // 초기 상태: 로그인이 안 되어 있고, 알림을 보여준 적이 없을 때만 true
  const [showModal, setShowModal] = useState(
    !isAuthenticated && !hasShownAlert,
  );

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem("loginAlertShown", "true"); // 탭 닫기 전까지 다시 안 띄움
    navigate("/", { replace: true });
  };

  // 1. 로그인 되어 있으면 정상 페이지 출력
  if (isAuthenticated) {
    return children;
  }

  // 2. 로그인 안 되어 있는데 모달을 보여줘야 하는 상황
  if (showModal) {
    return (
      <div style={modalOverlayStyle}>
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={modalContentStyle}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔒</div>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              로그인이 필요합니다
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              해당 서비스는 회원 전용입니다.
              <br />
              로그인 후 AI MATE의 기능을 이용해보세요!
            </p>
            <button onClick={handleCloseModal} style={modalButtonStyle}>
              로그인하러 가기
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 3. 이미 모달을 봤거나 닫았다면 그냥 로그인 페이지로 리다이렉트
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- 공개 경로 --- */}
        <Route path="/" element={<Login />} />
        <Route path="/auth/kakao/callback" element={<Login />} />

        {/* --- 🔒 보호된 경로 --- */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/select"
          element={
            <ProtectedRoute>
              <IdealSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-chat"
          element={
            <ProtectedRoute>
              <AiChatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment-fail"
          element={
            <ProtectedRoute>
              <div>결제에 실패했습니다.</div>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/chat"
          element={
            <ProtectedRoute>
              <HistoryChatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <Analyze />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- 팝업 스타일 정의 ---
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  backdropFilter: "blur(4px)",
};

const modalContentStyle = {
  width: "300px",
  backgroundColor: "#fff",
  borderRadius: "24px",
  padding: "30px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

const modalButtonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  fontWeight: "800",
  cursor: "pointer",
};

export default App;
