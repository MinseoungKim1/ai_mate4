import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, UserCircle, Zap, Heart } from "lucide-react";
import BottomNav from "../components/BottomNav";
import ConfirmModal from "../components/ConfirmModal";
import { API_URL } from "../config";

const MainHome = () => {
  const navigate = useNavigate();
  const [matchCount, setMatchCount] = useState(0);
  const [aiMatchCount, setAiMatchCount] = useState(0);
  const [isPro, setIsPro] = useState(false); // 💡 PRO 등급 상태 추가
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  const nickname = localStorage.getItem("nickname") || "사용자";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userEmail = localStorage.getItem("userEmail");

        const response = await fetch(`${API_URL}/api/user/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json());

        if (response.success && response.data) {
          setMatchCount(response.data.matchCount);
          setAiMatchCount(response.data.aiMatchCount);
          setIsPro(response.data.isPro); // 💡 백엔드에서 내려주는 isPro 저장
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 💡 사용 가능 여부 판별 로직 (PRO거나 이용권이 있거나)
  const canUseNormalMatch = isPro || matchCount > 0;
  const canUseAiMatch = isPro || aiMatchCount > 0;

  const handleBannerClick = () => {
    if (loading) return;
    if (canUseNormalMatch) {
      setModalType("match");
    } else {
      setModalType("payment");
    }
  };

  const handleAiCardClick = () => {
    if (loading) return;
    if (canUseAiMatch) {
      navigate("/select");
    } else {
      setModalType("payment");
    }
  };

  const handleConfirm = () => {
    if (modalType === "match") {
      setModalType(null);
      navigate("/chat?id=room_random_123");
    } else if (modalType === "payment") {
      setModalType(null);
      navigate("/payment");
    }
  };

  return (
    <div style={outerWrapperStyle}>
      <div style={appContainerStyle}>
        <ConfirmModal
          isOpen={modalType !== null}
          title={modalType === "match" ? "매칭 시작" : "매칭권 부족"}
          message={
            modalType === "match"
              ? isPro
                ? "프리미엄 혜택으로 무제한 대화가 가능합니다.\n지금 바로 시작할까요?"
                : `매칭권을 사용하여 대기를 시작할까요?\n(차감은 매칭 성공 시에만 이루어집니다.)`
              : `오늘 사용할 수 있는 횟수를 모두 소진했습니다.\n결제 페이지에서 충전할까요?`
          }
          confirmText={modalType === "match" ? "시작하기" : "충전하러 가기"}
          onConfirm={handleConfirm}
          onClose={() => setModalType(null)}
        />

        <header style={headerStyle}>
          <div style={greetingStyle}>
            안녕하세요, <span style={userNameStyle}>{nickname}님!</span> 👋
          </div>
          <div style={heartBadgeStyle}>
            <Heart size={16} fill="#ff4d4d" style={{ marginRight: "4px" }} /> 0
          </div>
        </header>

        {/* 1. 오늘의 무료 매칭 배너 */}
        <div
          style={canUseNormalMatch ? matchingBannerStyle : disabledBannerStyle}
          onClick={handleBannerClick}
        >
          <div style={bannerContentStyle}>
            <p style={bannerLabelStyle}>오늘의 무료 매칭</p>
            <h2 style={bannerTitleStyle}>
              {loading
                ? "확인 중..."
                : isPro
                  ? "무제한 이용 가능"
                  : matchCount > 0
                    ? `${matchCount}회 가능`
                    : "소진 완료"}
            </h2>
            <p style={bannerDescStyle}>
              {isPro
                ? "프리미엄 멤버십이 활성화 중입니다. ✨"
                : matchCount > 0
                  ? "매일 자정 1회가 리필됩니다."
                  : "충전 후 바로 대화해 보세요!"}
            </p>
          </div>
          <div style={bannerIconStyle}>
            <Sparkles size={100} color="rgba(255,255,255,0.2)" />
          </div>
        </div>

        <section style={mainSectionStyle}>
          <h3 style={sectionTitleStyle}>어떤 만남을 원하세요?</h3>

          {/* 2. 이상형 AI 대화 카드 */}
          <div
            style={canUseAiMatch ? idealTypeCardStyle : disabledCardStyle}
            onClick={handleAiCardClick}
          >
            <div style={iconCircleStyle}>
              <UserCircle
                size={28}
                color={canUseAiMatch ? "#ff4d4d" : "#bbb"}
              />
            </div>
            <h4 style={cardTitleStyle}>이상형 AI와 대화하기</h4>
            <p style={cardSubtitleStyle}>
              {loading
                ? "조회 중"
                : isPro
                  ? "프리미엄 무제한 이용"
                  : aiMatchCount > 0
                    ? `${aiMatchCount}회 이용 가능`
                    : "이용권 부족 (충전 필요)"}
            </p>
          </div>

          {/* 3. PRO 배너 (이미 PRO인 경우 안내 문구 변경 가능) */}
          <div style={isPro ? proActiveBannerStyle : proBannerStyle}>
            <div style={proHeaderStyle}>
              <Zap
                size={18}
                color={isPro ? "#8a4fff" : "#856404"}
                fill={isPro ? "#8a4fff" : "#856404"}
                style={{ marginRight: "8px" }}
              />
              <span style={isPro ? proActiveTitleStyle : proTitleStyle}>
                {isPro ? "프리미엄 멤버십 적용 중" : "PRO 혜택 안내"}
              </span>
            </div>
            <p style={isPro ? proActiveDescStyle : proDescStyle}>
              {isPro
                ? "모든 AI 분석 및 무제한 코칭 혜택을 누리고 계십니다."
                : "유료 구독 시 대화 중 실시간 AI 코칭을 받을 수 있습니다."}
            </p>
          </div>
        </section>
        <BottomNav />
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
// (기존 스타일 동일 유지 및 PRO 활성용 스타일 추가)

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
  padding: "30px 20px 20px",
};
const greetingStyle = { fontSize: "1.2rem", fontWeight: "bold", color: "#333" };
const userNameStyle = { color: "#333" };
const heartBadgeStyle = {
  backgroundColor: "#fff0f5",
  color: "#ff4d4d",
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "0.9rem",
  fontWeight: "800",
  display: "flex",
  alignItems: "center",
};
const matchingBannerStyle = {
  margin: "0 20px",
  padding: "25px",
  borderRadius: "24px",
  background: "linear-gradient(135deg, #8a4fff 0%, #6b21ff 100%)",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(107, 33, 255, 0.3)",
  cursor: "pointer",
  transition: "all 0.3s ease",
};
const disabledBannerStyle = {
  ...matchingBannerStyle,
  background: "linear-gradient(135deg, #bbb 0%, #999 100%)",
  boxShadow: "none",
};
const bannerContentStyle = { position: "relative", zIndex: 1 };
const bannerLabelStyle = {
  fontSize: "0.9rem",
  opacity: 0.9,
  marginBottom: "8px",
};
const bannerTitleStyle = { fontSize: "1.8rem", margin: 0, fontWeight: "900" };
const bannerDescStyle = {
  fontSize: "0.85rem",
  opacity: 0.8,
  marginTop: "12px",
};
const bannerIconStyle = {
  position: "absolute",
  right: "-10px",
  bottom: "-10px",
  opacity: 0.3,
  transform: "rotate(-15deg)",
};
const mainSectionStyle = {
  flex: 1,
  padding: "30px 20px",
  backgroundColor: "#fbfcfd",
  borderTopLeftRadius: "30px",
  borderTopRightRadius: "30px",
  marginTop: "20px",
};
const sectionTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "800",
  marginBottom: "20px",
  color: "#222",
};
const idealTypeCardStyle = {
  backgroundColor: "#fff",
  padding: "35px 20px",
  borderRadius: "24px",
  textAlign: "center",
  cursor: "pointer",
  marginBottom: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  border: "1px solid #f0f0f0",
};
const disabledCardStyle = {
  ...idealTypeCardStyle,
  backgroundColor: "#f9f9f9",
  opacity: 0.7,
};
const iconCircleStyle = {
  width: "55px",
  height: "55px",
  borderRadius: "50%",
  backgroundColor: "#fff0f0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto 15px",
};
const cardTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "800",
  margin: "0 0 8px 0",
  color: "#333",
};
const cardSubtitleStyle = {
  fontSize: "0.85rem",
  color: "#aaa",
  fontWeight: "500",
};

// PRO 활성화용 스타일
const proBannerStyle = {
  backgroundColor: "#fffdf0",
  padding: "20px",
  borderRadius: "20px",
  border: "1px solid #ffecb3",
};
const proActiveBannerStyle = {
  backgroundColor: "#f8f6ff",
  padding: "20px",
  borderRadius: "20px",
  border: "1px solid #e0d4ff",
};
const proHeaderStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
};
const proTitleStyle = {
  fontWeight: "800",
  color: "#856404",
  fontSize: "0.95rem",
};
const proActiveTitleStyle = {
  fontWeight: "800",
  color: "#6b21ff",
  fontSize: "0.95rem",
};
const proDescStyle = {
  fontSize: "0.85rem",
  color: "#856404",
  opacity: 0.8,
  lineHeight: "1.5",
};
const proActiveDescStyle = {
  fontSize: "0.85rem",
  color: "#6b21ff",
  opacity: 0.8,
  lineHeight: "1.5",
};

export default MainHome;
