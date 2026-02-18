import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  ChevronRight,
  Clock,
  CreditCard,
  LogOut,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import BottomNav from "../components/BottomNav";
import { API_URL } from "../config";

const MyPage = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    matchCount: 0,
    aiMatchCount: 0,
    isPro: false,
    nickname: localStorage.getItem("nickname") || "사용자",
    email: localStorage.getItem("userEmail") || "이메일 없음",
  });
  const [loading, setLoading] = useState(true);

  // 1. 초기 로드 시 서버로부터 유저 상태 가져오기
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const userEmail = localStorage.getItem("userEmail");
        const response = await fetch(`${API_URL}/api/user/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json());

        if (response.success && response.data) {
          setUserData((prev) => ({
            ...prev,
            matchCount: response.data.matchCount,
            aiMatchCount: response.data.aiMatchCount,
            isPro: response.data.isPro,
          }));
        }
      } catch (error) {
        console.error("마이페이지 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleConfirmLogout = () => {
    localStorage.clear();
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  return (
    <div style={outerWrapperStyle}>
      <div style={appContainerStyle}>
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="로그아웃"
          message="정말로 로그아웃 하시겠습니까?"
          onConfirm={handleConfirmLogout}
          onClose={() => setIsLogoutModalOpen(false)}
          confirmText="로그아웃"
        />

        <header style={headerStyle}>
          <button onClick={() => navigate("/home")} style={backBtnStyle}>
            <ChevronLeft size={28} color="#333" />
          </button>
          <h3 style={headerTitleStyle}>마이페이지</h3>
          <div style={{ width: "28px" }}></div>
        </header>

        <div style={contentStyle}>
          {/* 프로필 정보 */}
          <div style={profileSectionStyle}>
            <div style={profileCircleStyle}>
              {userData.isPro ? (
                <div style={proBadgeWrapperStyle}>
                  <User size={40} color="#8a4fff" />
                  <Sparkles size={20} color="#8a4fff" style={proSparkleStyle} />
                </div>
              ) : (
                <User size={40} color="#adb5bd" />
              )}
            </div>
            <h3 style={profileNameStyle}>{userData.nickname}님</h3>
            <p style={profileEmailStyle}>{userData.email}</p>
          </div>

          {/* 구독 및 이용 횟수 정보 */}
          <div style={infoBoxStyle}>
            <div style={infoItemStyle}>
              <span style={infoLabelStyle}>멤버십 등급</span>
              <span
                style={{
                  ...infoValueStyle,
                  color: userData.isPro ? "#8a4fff" : "#ff4d4d",
                }}
              >
                {userData.isPro ? "프리미엄 구독 중" : "일반 회원"}
              </span>
            </div>
            <div style={infoItemStyle}>
              <span style={infoLabelStyle}>실시간 대화 가능</span>
              <span style={infoValueStyle}>
                {userData.isPro ? "무제한" : `${userData.matchCount}회`}
              </span>
            </div>
            <div style={{ ...infoItemStyle, borderBottom: "none" }}>
              <span style={infoLabelStyle}>AI 대화 가능</span>
              <span style={infoValueStyle}>
                {userData.isPro ? "무제한" : `${userData.aiMatchCount}회`}
              </span>
            </div>
          </div>

          {/* 메뉴 그룹 */}
          <div style={menuGroupStyle}>
            <button
              onClick={() => navigate("/history")}
              style={menuButtonStyle}
            >
              <div style={menuLabelWrapper}>
                <Clock size={20} color="#555" style={{ marginRight: "12px" }} />
                <span>대화 기록 보기</span>
              </div>
              <ChevronRight size={18} color="#ccc" />
            </button>

            <button
              onClick={() => navigate("/payment")}
              style={menuButtonStyle}
            >
              <div style={menuLabelWrapper}>
                <CreditCard
                  size={20}
                  color="#555"
                  style={{ marginRight: "12px" }}
                />
                <span>이용권 구매 / 구독 관리</span>
              </div>
              <ChevronRight size={18} color="#ccc" />
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              style={{ ...menuButtonStyle, color: "#bbb", marginTop: "10px" }}
            >
              <div style={menuLabelWrapper}>
                <LogOut
                  size={20}
                  color="#bbb"
                  style={{ marginRight: "12px" }}
                />
                <span>로그아웃</span>
              </div>
              <ChevronRight size={18} color="#bbb" />
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

// --- 스타일 정의 ---

const outerWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f0f2f5",
};
const appContainerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "95vh",
  backgroundColor: "#fff",
  borderRadius: "30px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #f8f9fa",
  backgroundColor: "white",
};
const headerTitleStyle = {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "#333",
};
const contentStyle = { flex: 1, padding: "30px 20px", overflowY: "auto" };
const profileSectionStyle = { textAlign: "center", marginBottom: "30px" };
const profileCircleStyle = {
  width: "90px",
  height: "90px",
  backgroundColor: "#f8f9fa",
  borderRadius: "50%",
  margin: "0 auto 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  position: "relative",
};
const profileNameStyle = {
  fontSize: "1.4rem",
  fontWeight: "bold",
  margin: "0 0 5px 0",
  color: "#333",
};
const profileEmailStyle = { fontSize: "0.9rem", color: "#aaa" };
const infoBoxStyle = {
  backgroundColor: "#fbfcfd",
  borderRadius: "24px",
  padding: "10px 25px",
  border: "1px solid #f0f0f0",
  marginBottom: "30px",
};
const infoItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "18px 0",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "0.95rem",
};
const infoLabelStyle = { color: "#777" };
const infoValueStyle = { fontWeight: "bold", color: "#333" };
const menuGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};
const menuButtonStyle = {
  width: "100%",
  padding: "18px 20px",
  textAlign: "left",
  backgroundColor: "white",
  border: "1px solid #f0f0f0",
  borderRadius: "18px",
  cursor: "pointer",
  fontSize: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#444",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
};
const menuLabelWrapper = { display: "flex", alignItems: "center" };
const backBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
};

// PRO 전용 추가 스타일
const proBadgeWrapperStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const proSparkleStyle = { position: "absolute", top: "-10px", right: "-10px" };

export default MyPage;
