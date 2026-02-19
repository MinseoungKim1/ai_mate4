import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { API_URL } from "../config";

const Analyze = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [remainingAiCount, setRemainingAiCount] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (fetchedRef.current) return;
      
      try {
        const roomId = location.state?.roomId;

        if (!roomId) {
          console.warn("Room ID not found in location state.");
          setLoading(false);
          return;
        }

        fetchedRef.current = true;

        const response = await fetch(`${API_URL}/api/history/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            if (text.startsWith("<!DOCTYPE")) {
              throw new Error("서버 소스가 최신이 아닙니다. 백엔드를 재시작해 주세요.");
            }
            throw new Error(`분석 요청 실패 (${res.status})`);
          }
          return res.json();
        });

        if (response.success && response.data) {
          // 백엔드 데이터(ChatAnalysis 모델)를 프론트엔드 UI 형식으로 변환
          const raw = response.data;
          const formattedData = {
              totalScore: raw.totalScore,
              style: raw.personalityTags?.[0] || "분석 완료",
              desc: raw.strengths || "대화 내용이 충분하지 않아 분석이 어렵습니다.",
              advice: raw.improvements || "비슷한 관심사를 공유해보세요.",
              stats: [
                  { label: "센스", value: raw.humorScore || 50, icon: <Zap size={16} /> },
                  { label: "호감도", value: raw.mannerScore || 50, icon: <Heart size={16} /> },
                  { label: "대화량", value: raw.activenessScore || 50, icon: <MessageCircle size={16} /> },
                  { label: "공감능력", value: raw.empathyScore || 50, icon: <Star size={16} /> },
              ],
          };
          setAnalysis(formattedData);

          // Then fetch status for remaining count
          const userEmail = localStorage.getItem("userEmail");
          const statusRes = await fetch(`${API_URL}/api/user/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          }).then((res) => res.json());

          if (statusRes.success && statusRes.data) {
            setRemainingAiCount(statusRes.data.aiMatchCount);
          }
          setLoading(false);
        } else {
          window.alert(response.message || "분석결과를 불러오지 못했습니다.");
          navigate("/home");
        }
      } catch (error) {
        console.error("분석 로드 중 오류 발생:", error);
        window.alert(error.message || "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        navigate("/home");
      }
    };

    fetchAnalysis();
  }, [navigate, location.state]);

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

  // Use real analysis data or fallback to prevent crash
  const displayData = analysis || {
    totalScore: 0,
    style: "분석 실패",
    desc: "데이터를 불러오지 못했습니다.",
    stats: [],
  };
  const adviceText = analysis?.advice || "분석 결과가 없습니다.";

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
            onClick={() => alert("리포트를 공유합시다!")}
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
              분석 완료 (남은 AI권: {remainingAiCount ?? 0}회)
            </div>
            <div style={scoreCircleStyle}>
              <span style={scoreTextStyle}>{displayData.totalScore}</span>
              <span style={scoreUnitStyle}>점</span>
            </div>
            <h2 style={styleTitleStyle}>"{displayData.style}"</h2>
            <p style={styleDescStyle}>{displayData.desc}</p>
          </motion.div>

          {/* 2. 세부 능력치 그래프 영역 */}
          <div style={statsContainerStyle}>
            <h4 style={sectionTitleStyle}>상세 능력치</h4>
            {displayData.stats.map((stat) => (
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
              {adviceText}
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
