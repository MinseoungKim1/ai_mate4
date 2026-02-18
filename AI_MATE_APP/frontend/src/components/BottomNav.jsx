import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 💡 사용할 아이콘들을 임포트합니다.
import { Home, History, User } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에 따라 활성화 색상을 결정하는 함수
  const getNavColor = (path) =>
    location.pathname === path ? "#ff4d4d" : "#aaa";

  return (
    <nav style={bottomNavStyle}>
      {/* 홈 메뉴 */}
      <div
        style={navItemStyle(getNavColor("/home"))}
        onClick={() => navigate("/home")}
      >
        <Home
          size={22}
          color={getNavColor("/home")}
          strokeWidth={location.pathname === "/home" ? 2.5 : 2}
        />
        <span style={navTextStyle}>홈</span>
      </div>

      {/* 기록 메뉴 */}
      <div
        style={navItemStyle(getNavColor("/history"))}
        onClick={() => navigate("/history")}
      >
        <History
          size={22}
          color={getNavColor("/history")}
          strokeWidth={location.pathname === "/history" ? 2.5 : 2}
        />
        <span style={navTextStyle}>기록</span>
      </div>

      {/* 마이페이지 메뉴 */}
      <div
        style={navItemStyle(getNavColor("/mypage"))}
        onClick={() => navigate("/mypage")}
      >
        <User
          size={22}
          color={getNavColor("/mypage")}
          strokeWidth={location.pathname === "/mypage" ? 2.5 : 2}
        />
        <span style={navTextStyle}>MY</span>
      </div>
    </nav>
  );
};

// --- ✨ 스타일 정의 ---

const bottomNavStyle = {
  height: "70px",
  borderTop: "1px solid #f0f0f0",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: "#fff",
  paddingBottom: "10px", // 모바일 하단 바 여유 공간
};

const navItemStyle = (color) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: color,
  flex: 1,
  transition: "all 0.2s ease", // 부드러운 색상 전환
});

const navTextStyle = {
  fontSize: "0.75rem",
  fontWeight: "700",
  marginTop: "6px",
};

export default BottomNav;
