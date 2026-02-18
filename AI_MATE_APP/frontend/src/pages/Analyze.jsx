import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Zap,
  MessageCircle,
  Heart,
  Star,
  Share2,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

const Analyze = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [remainingAiCount, setRemainingAiCount] = useState(null);

  const analysisData = {
    totalScore: 85,
    grade: "A-",
    style: "다정다감한 공감형",
    desc: "상대방의 감정을 잘 캐치하고 부드럽게 대화를 이끄는 능력이 탁월하시네요!",
    stats: [
      { label: "센스", value: 90, icon: <Zap size={16} /> },
      { label: "호감도", value: 82, icon: <Heart size={16} /> },
      { label: "대화량", value: 75, icon: <MessageCircle size={16} /> },
      { label: "공감능력", value: 95, icon: <Star size={16} /> },
    ],
  };

  // 💡 수정된 로직: 차감 요청이 아닌 '상태 조회'만 수행
  useEffect(() => {
    const fetchLatestStatus = async () => {
      try {
        // 1. 시각적인 분석 연출 (2초)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 2. 서버에서 차감된 후의 '최신 상태'만 가져옴
        const userEmail = localStorage.getItem("userEmail");
        const response = await fetch("http://localhost:3000/api/user/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json());

        if (response.success && response.data) {
          // 💡 이미 AiChatRoom에서 차감되었으므로 최신 결과값만 세팅
          setRemainingAiCount(response.data.aiMatchCount);
          setLoading(false);
        } else {
          navigate("/home");
        }
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        navigate("/home");
      }
    };

    fetchLatestStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div style={outerWrapperStyle}>
        <div style={containerStyle}>
          <div style={loadingContainerStyle}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={loadingSpinnerStyle}
            />
            <h3 style={{ marginTop: "20px", color: "#6b21ff" }}>
              AI가 대화를 분석 중입니다...
            </h3>
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
              거의 다 되었습니다! 잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={outerWrapperStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <button onClick={() => navigate("/home")} style={backBtnStyle}>
            <ChevronLeft size={28} color="#333" />
          </button>
          <h3 style={headerTitleStyle}>AI 분석 리포트</h3>
          <button
            style={shareBtnStyle}
            onClick={() => alert("리포트를 공유합니다!")}
          >
            <Share2 size={20} color="#333" />
          </button>
        </header>

        <div style={contentStyle}>
          {/* 1. 종합 점수 & 등급 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={scoreCardStyle}
          >
            <div style={badgeStyle}>
              분석 완료 (남은 AI권: {remainingAiCount}회)
            </div>
            <div style={scoreCircleStyle}>
              <span style={scoreTextStyle}>{analysisData.totalScore}</span>
              <span style={scoreUnitStyle}>점</span>
            </div>
            <h2 style={styleTitleStyle}>"{analysisData.style}"</h2>
            <p style={styleDescStyle}>{analysisData.desc}</p>
          </motion.div>

          {/* 2. 세부 능력치 그래프 영역 */}
          <div style={statsContainerStyle}>
            <h4 style={sectionTitleStyle}>상세 능력치</h4>
            {analysisData.stats.map((stat) => (
              <div key={stat.label} style={statRowStyle}>
                <div style={statLabelStyle}>
                  {stat.icon}
                  <span style={{ marginLeft: "8px" }}>{stat.label}</span>
                </div>
                <div style={progressBgStyle}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={progressFillStyle}
                  />
                </div>
                <span style={statValueStyle}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* 3. AI의 조언 한마디 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={adviceBoxStyle}
          >
            <div style={adviceTitleStyle}>💡 AI 코치의 한마디</div>
            <p style={adviceContentStyle}>
              질문과 답변의 비율이 아주 이상적입니다! 다음 대화에서는 상대방의
              취미에 대해 조금 더 깊게 질문해본다면 호감도가 더 빠르게 상승할 것
              같아요.
            </p>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

// 스타일 정의 (기존과 동일)
const outerWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f0f2f5",
};
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "420px",
  height: "95vh",
  backgroundColor: "#fff",
  borderRadius: "30px",
  overflow: "hidden",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  position: "relative",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #f8f9fa",
};
const headerTitleStyle = {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "#333",
};
const backBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
const shareBtnStyle = { background: "none", border: "none", cursor: "pointer" };
const contentStyle = {
  flex: 1,
  padding: "20px",
  overflowY: "auto",
  backgroundColor: "#fbfcfd",
};
const scoreCardStyle = {
  background: "linear-gradient(135deg, #8a4fff 0%, #6b21ff 100%)",
  borderRadius: "28px",
  padding: "30px 20px",
  textAlign: "center",
  color: "#fff",
  marginBottom: "25px",
  boxShadow: "0 10px 20px rgba(107, 33, 255, 0.2)",
};
const badgeStyle = {
  backgroundColor: "rgba(255,255,255,0.2)",
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "bold",
  marginBottom: "15px",
};
const scoreCircleStyle = { marginBottom: "15px" };
const scoreTextStyle = { fontSize: "4rem", fontWeight: "900" };
const scoreUnitStyle = { fontSize: "1.2rem", marginLeft: "4px", opacity: 0.8 };
const styleTitleStyle = {
  fontSize: "1.3rem",
  fontWeight: "800",
  marginBottom: "10px",
};
const styleDescStyle = { fontSize: "0.9rem", opacity: 0.9, lineHeight: "1.5" };
const statsContainerStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid #f0f0f0",
  marginBottom: "20px",
};
const sectionTitleStyle = {
  margin: "0 0 20px 0",
  fontSize: "1rem",
  fontWeight: "800",
  color: "#333",
};
const statRowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "15px",
};
const statLabelStyle = {
  width: "80px",
  display: "flex",
  alignItems: "center",
  fontSize: "0.85rem",
  color: "#666",
  fontWeight: "600",
};
const progressBgStyle = {
  flex: 1,
  height: "8px",
  backgroundColor: "#f0f0f0",
  borderRadius: "4px",
  margin: "0 12px",
  overflow: "hidden",
};
const progressFillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, #ff6b6b, #ff4d4d)",
  borderRadius: "4px",
};
const statValueStyle = {
  width: "25px",
  fontSize: "0.85rem",
  fontWeight: "bold",
  color: "#333",
  textAlign: "right",
};
const adviceBoxStyle = {
  backgroundColor: "#fff5f5",
  padding: "20px",
  borderRadius: "20px",
  border: "1px solid #ffe3e3",
};
const adviceTitleStyle = {
  fontWeight: "800",
  color: "#ff4d4d",
  marginBottom: "8px",
  fontSize: "0.95rem",
};
const adviceContentStyle = {
  fontSize: "0.85rem",
  color: "#666",
  lineHeight: "1.6",
};
const loadingContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};
const loadingSpinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #f0f0f0",
  borderTop: "4px solid #8a4fff",
  borderRadius: "50%",
};

export default Analyze;
