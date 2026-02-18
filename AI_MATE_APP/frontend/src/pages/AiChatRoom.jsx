import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, BarChart2 } from "lucide-react";
import { io } from "socket.io-client";
import { API_URL } from "../config";
import ProModal from "../components/ProModal";
import AnalyzeModal from "../components/AnalyzeModal";

let socket;

const AiChatRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tags = [], age = "" } = location.state || {}; // 💡 IdealSelect에서 넘어온 정보

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [turnCount, setTurnCount] = useState(0);

  const [isProUser, setIsProUser] = useState(false);
  const [aiMatchCount, setAiMatchCount] = useState(0); // 💡 AI 이용권 개수 상태 추가
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef();
  const isInitialized = useRef(false);

  const nickname = localStorage.getItem("nickname") || "사용자";

  // 1. 유저 상태 로드 및 초기 시나리오
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        const response = await fetch(`${API_URL}/api/user/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json());

        if (response.success && response.data) {
          setIsProUser(response.data.isPro);
          setAiMatchCount(response.data.aiMatchCount); // 💡 이용권 개수 업데이트
        }
      } catch (e) {
        console.error("유저 상태 로드 실패:", e);
      }
    };

    fetchUserStatus();

    if (socket) socket.disconnect();
    socket = io(API_URL);

    socket.on("receive-ai-message", (data) => {
      setMessages((prev) => [...prev, { ...data, id: Date.now() }]);
      setIsAiTyping(false);
    });

    socket.on("error", (data) => {
      alert(data.message);
      setIsAiTyping(false);
    });

    if (isInitialized.current) return;
    isInitialized.current = true;

    const introScenario = [
      {
        id: 1,
        sender: "system",
        text: `메이트님이 이상형 AI '지아'님과 ${nickname}님을 초대했습니다.`,
      },
      {
        id: 2,
        sender: "mate",
        text: "안녕! 둘이 취향이 정말 비슷해서 내가 특별히 자리를 마련해봤어. 😊",
      },
      {
        id: 3,
        sender: "mate",
        text: "어색해하지 말고 편하게 대화 나눠봐! 난 이만 가볼게, 둘이 잘해봐! ✨",
      },
      { id: 4, sender: "system", text: "메이트님이 대화방을 나갔습니다." },
      {
        id: 5,
        sender: "other",
        text: "기다리고 있었어요! 오늘 하루는 어떠셨나요? 😊",
      },
    ];

    introScenario.forEach((msg, index) => {
      setTimeout(
        () => {
          setMessages((prev) => [...prev, msg]);
        },
        (index + 1) * 900,
      );
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [nickname]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isAiTyping]);

  const handleSend = () => {
    if (!inputText.trim() || isAiTyping) return;

    const userMsg = { id: Date.now(), sender: "me", text: inputText };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInputText("");
    setTurnCount((prev) => prev + 1);
    setIsAiTyping(true);

    // AI에게 대화 기록 전달 (시스템 메시지 제외)
    const chatHistory = newMessages.filter(m => m.sender === "me" || m.sender === "other");
    socket.emit("send-ai-message", {
      messages: chatHistory,
      context: { tags, age } // 💡 이상형 정보를 함께 전달
    });
  };

  // 💡 [핵심 수정] 3. 분석 버튼 클릭 시 조건 체크
  const handleAnalyzeButtonClick = () => {
    // 이용권이 1개 이상 있거나, 이용권이 없어도 PRO 유저라면 분석 가능
    const canAnalyze = aiMatchCount > 0 || isProUser;

    if (canAnalyze) {
      // 조건 충족 시 연애 점수 분석(횟수 확인) 모달 노출
      setIsAnalyzeModalOpen(true);
    } else {
      // 둘 다 해당 안 될 때만 결제 유도 모달 노출
      setIsProModalOpen(true);
    }
  };

  const onConfirmAnalyze = async () => {
    if (isSubmitting) return;

    setIsAnalyzeModalOpen(false);

    try {
      setIsSubmitting(true);
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(
        `${API_URL}/api/user/match/ai/use`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        },
      ).then((res) => res.json());

      if (response.success) {
        navigate("/analyze");
      } else {
        // 백엔드에서 체크하겠지만 프론트에서도 한 번 더 방어
        alert("이용 권한이 없습니다.");
      }
    } catch (error) {
      console.error("AI 차감 중 오류:", error);
      alert("통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={outerWrapperStyle}>
      <div style={containerStyle}>
        <ProModal
          isOpen={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
          onUpgrade={() => navigate("/payment")}
        />
        <AnalyzeModal
          isOpen={isAnalyzeModalOpen}
          turnCount={turnCount}
          onClose={() => setIsAnalyzeModalOpen(false)}
          onConfirm={onConfirmAnalyze}
        />

        <header style={headerStyle}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            <ChevronLeft size={24} color="#333" />
          </button>
          <div style={headerContentStyle}>
            <span style={headerTitleStyle}>이상형 AI 대화</span>
            <div style={progressWrapperStyle}>
              <div style={progressContainerStyle}>
                <motion.div
                  animate={{
                    width: `${Math.min((turnCount / 10) * 100, 100)}%`,
                  }}
                  style={progressFillStyle}
                />
              </div>
              <span style={turnTextStyle}>{turnCount}/10</span>
            </div>
          </div>
          <button onClick={handleAnalyzeButtonClick} style={analyzeButtonStyle}>
            <BarChart2 size={16} style={{ marginRight: "4px" }} /> 분석
          </button>
        </header>

        <div style={chatListStyle} ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={messageWrapperStyle(msg.sender)}
              >
                {(msg.sender === "other" || msg.sender === "mate") && (
                  <div style={profileStyle(msg.sender)}>
                    {msg.sender === "mate" ? "M" : "AI"}
                  </div>
                )}
                <div style={bubbleStyle(msg.sender)}>{msg.text}</div>
              </motion.div>
            ))}
            {isAiTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={messageWrapperStyle("other")}
              >
                <div style={profileStyle("other")}>AI</div>
                <div style={typingBubbleStyle}>입력 중...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={inputAreaStyle}>
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="AI에게 메시지를 보내보세요..."
              style={inputFieldStyle}
            />
            <button
              onClick={handleSend}
              style={sendButtonStyle(inputText)}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? "#fff" : "#ccc"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 스타일 정의 (이전과 동일)
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
  backgroundColor: "#f8f9fb",
  borderRadius: "30px",
  overflow: "hidden",
  position: "relative",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};
const headerStyle = {
  display: "flex",
  alignItems: "center",
  padding: "15px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #f0f0f0",
  justifyContent: "space-between",
  zIndex: 10,
};
const backButtonStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
};
const headerContentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
};
const headerTitleStyle = {
  fontWeight: "800",
  fontSize: "0.95rem",
  color: "#333",
};
const progressWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "4px",
};
const progressContainerStyle = {
  width: "60px",
  height: "4px",
  backgroundColor: "#eee",
  borderRadius: "2px",
  overflow: "hidden",
};
const progressFillStyle = { height: "100%", backgroundColor: "#ff4d4d" };
const turnTextStyle = {
  fontSize: "0.65rem",
  color: "#aaa",
  fontWeight: "bold",
};
const analyzeButtonStyle = {
  display: "flex",
  alignItems: "center",
  padding: "6px 12px",
  backgroundColor: "#8a4fff",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "bold",
  cursor: "pointer",
};
const chatListStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};
const messageWrapperStyle = (sender) => ({
  display: "flex",
  justifyContent:
    sender === "me"
      ? "flex-end"
      : sender === "system"
        ? "center"
        : "flex-start",
  alignItems: "flex-end",
  marginBottom: sender === "system" ? "10px" : "0",
});
const bubbleStyle = (sender) => ({
  maxWidth: "75%",
  padding: "10px 14px",
  borderRadius:
    sender === "me"
      ? "18px 18px 4px 18px"
      : sender === "system"
        ? "10px"
        : "18px 18px 18px 4px",
  backgroundColor:
    sender === "system"
      ? "rgba(0,0,0,0.05)"
      : sender === "me"
        ? "#8a4fff"
        : sender === "mate"
          ? "#fff0f0"
          : "#fff",
  color: sender === "me" ? "#fff" : "#333",
  fontSize: sender === "system" ? "0.75rem" : "0.9rem",
  boxShadow: sender === "system" ? "none" : "0 2px 5px rgba(0,0,0,0.05)",
  textAlign: sender === "system" ? "center" : "left",
  fontWeight: sender === "system" ? "600" : "500",
});
const typingBubbleStyle = {
  ...bubbleStyle("other"),
  color: "#aaa",
  fontStyle: "italic",
};
const profileStyle = (sender) => ({
  width: "30px",
  height: "30px",
  borderRadius: "10px",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "0.7rem",
  fontWeight: "bold",
  marginRight: "8px",
});
const inputAreaStyle = {
  padding: "15px 20px 30px",
  backgroundColor: "#fff",
  borderTop: "1px solid #f0f0f0",
};
const inputContainerStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f5f6f8",
  borderRadius: "20px",
  padding: "5px 5px 5px 12px",
};
const inputFieldStyle = {
  flex: 1,
  border: "none",
  background: "none",
  outline: "none",
  fontSize: "0.9rem",
  padding: "8px 0",
};
const sendButtonStyle = (text) => ({
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "none",
  background: text.trim() ? "#8a4fff" : "#f0f0f0",
  cursor: text.trim() ? "pointer" : "default",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export default AiChatRoom;
