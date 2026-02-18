import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, BarChart2, Loader2, LogOut } from "lucide-react";
import { io } from "socket.io-client";
import ProModal from "../components/ProModal";
import AnalyzeModal from "../components/AnalyzeModal";

let socket;

const ChatRoom = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [partnerNickname, setPartnerNickname] = useState("");

  const [isProUser, setIsProUser] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef();
  const roomIdRef = useRef(null);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        const response = await fetch("http://localhost:3000/api/user/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json());

        if (response.success && response.data) {
          setIsProUser(response.data.isPro);
          setMatchCount(response.data.matchCount);
        }
      } catch (e) {
        console.error("상태 로드 실패", e);
      }
    };

    fetchUserStatus();

    if (socket) socket.disconnect();
    socket = io("http://localhost:3000");
    const userEmail = localStorage.getItem("userEmail");

    socket.emit("join-room", { email: userEmail });

    socket.on("match-success", (data) => {
      roomIdRef.current = data.roomId;
      setCurrentRoomId(data.roomId);
      setPartnerNickname(data.partnerNickname);
      setIsConnected(true);

      setMessages((prev) => {
        if (prev.some((m) => m.id === "sys-connect")) return prev;
        return [
          ...prev,
          {
            id: "sys-connect",
            sender: "system",
            text: `${data.partnerNickname}님과 연결되었습니다.`,
          },
        ];
      });
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "other", text: data.text },
      ]);
    });

    socket.on("partner-left", () => {
      setIsConnected(false);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.id === "sys-exit") return prev;
        return [
          ...prev,
          {
            id: "sys-exit",
            sender: "system",
            text: "상대방이 대화방을 나갔습니다.",
          },
        ];
      });
    });

    const handleBeforeUnload = (e) => {
      if (isConnected) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (socket) {
        socket.emit("leave-room", { roomId: roomIdRef.current });
        socket.disconnect();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // 💡 [수정됨] 분석 확인 시 호출되는 함수
  const onConfirmAnalyze = async () => {
    if (isSubmitting) return;
    setIsAnalyzeModalOpen(false);
    try {
      setIsSubmitting(true);
      const userEmail = localStorage.getItem("userEmail");

      // 서버의 매칭권 차감 API 호출
      const response = await fetch("http://localhost:3000/api/user/match/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      }).then((res) => res.json());

      if (response.success) {
        // 차감 성공 시 분석 페이지로 이동 (roomId와 상대방 닉네임을 들고 감)
        navigate("/analyze", {
          state: { roomId: currentRoomId, partnerNickname },
        });
      } else {
        alert(response.message || "이용 권한이 없습니다.");
      }
    } catch (error) {
      console.error("차감 중 오류:", error);
      alert("통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmExit = () => {
    if (socket) socket.emit("leave-room", { roomId: currentRoomId });
    navigate("/home", { replace: true });
  };

  const handleSend = async () => {
    if (!inputText.trim() || !isConnected || !currentRoomId) return;

    const text = inputText;
    const msgData = { id: Date.now(), sender: "me", text };

    setMessages((prev) => [...prev, msgData]);
    setInputText("");
    setTurnCount((prev) => prev + 1);

    socket.emit("send-message", { roomId: currentRoomId, text });

    try {
      await fetch("http://localhost:3000/api/history/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentRoomId,
          sender: "me",
          text: text,
          userEmail: localStorage.getItem("userEmail"),
        }),
      });
    } catch (e) {
      console.error("대화 저장 실패", e);
    }
  };

  const handleAnalyzeClick = () => {
    if (!isConnected) return;
    const canAnalyze = matchCount > 0 || isProUser;
    if (canAnalyze) {
      setIsAnalyzeModalOpen(true);
    } else {
      setIsProModalOpen(true);
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

        {/* 💡 onConfirm={onConfirmAnalyze} 이 부분이 에러를 일으켰던 곳입니다. */}
        <AnalyzeModal
          isOpen={isAnalyzeModalOpen}
          turnCount={turnCount}
          onClose={() => setIsAnalyzeModalOpen(false)}
          onConfirm={onConfirmAnalyze}
        />

        <AnimatePresence>
          {isExitModalOpen && (
            <div style={modalOverlayStyle}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={exitModalStyle}
              >
                <div
                  style={{
                    backgroundColor: "#fff0f0",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto 15px",
                  }}
                >
                  <LogOut color="#ff4d4d" size={24} />
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  대화를 종료할까요?
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#777",
                    marginBottom: "20px",
                  }}
                >
                  지금 나가시면 현재 대화 내용은
                  <br />
                  히스토리에서만 확인 가능합니다.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setIsExitModalOpen(false)}
                    style={cancelButtonStyle}
                  >
                    계속 대화하기
                  </button>
                  <button onClick={confirmExit} style={exitButtonStyle}>
                    대화 종료
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <header style={headerStyle}>
          <button
            onClick={() =>
              isConnected ? setIsExitModalOpen(true) : navigate("/home")
            }
            style={backButtonStyle}
          >
            <ChevronLeft size={24} color="#333" />
          </button>
          <div style={headerContentStyle}>
            <span style={headerTitleStyle}>
              {isConnected ? `${partnerNickname}님과 대화` : "실시간 매칭"}
            </span>
            <div style={statusTextStyle(isConnected)}>
              {isConnected ? "● 연결 완료" : "상대방 찾는 중..."}
            </div>
          </div>
          <button
            onClick={handleAnalyzeClick}
            style={analyzeButtonStyle(isProUser, isConnected)}
            disabled={!isConnected}
          >
            <BarChart2 size={16} style={{ marginRight: "4px" }} /> 분석
          </button>
        </header>

        <div style={chatListStyle} ref={scrollRef}>
          {!isConnected && !messages.some((m) => m.sender === "system") && (
            <div style={loadingOverlayStyle}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 size={40} color="#8a4fff" />
              </motion.div>
              <p style={loadingTextStyle}>상대방과 연결 중입니다...</p>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={messageWrapperStyle(msg.sender)}
              >
                {msg.sender === "system" ? (
                  <div style={systemMessageStyle}>{msg.text}</div>
                ) : (
                  <>
                    {msg.sender === "other" && (
                      <div style={profileStyle}>
                        {partnerNickname ? partnerNickname[0] : "P"}
                      </div>
                    )}
                    <div style={bubbleStyle(msg.sender)}>{msg.text}</div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div style={inputAreaStyle}>
          <div
            style={
              isConnected ? inputContainerStyle : disabledInputContainerStyle
            }
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isConnected ? "메시지를 입력하세요..." : "대화가 불가능합니다."
              }
              style={inputFieldStyle}
              disabled={!isConnected}
            />
            <button
              onClick={handleSend}
              style={sendButtonStyle(inputText, isConnected)}
              disabled={!inputText.trim() || !isConnected}
            >
              <Send
                size={20}
                color={inputText.trim() && isConnected ? "#fff" : "#ccc"}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 스타일 정의 (이전과 동일하여 생략)
// ... [이전과 동일한 스타일 코드들]
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(2px)",
};
const exitModalStyle = {
  width: "280px",
  backgroundColor: "#fff",
  borderRadius: "24px",
  padding: "25px",
  textAlign: "center",
  boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
};
const cancelButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #eee",
  backgroundColor: "#fff",
  color: "#777",
  fontWeight: "600",
  cursor: "pointer",
};
const exitButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
};
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
  padding: "4px",
};
const headerContentStyle = {
  flex: 1,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
};
const headerTitleStyle = { fontWeight: "800", fontSize: "1rem", color: "#333" };
const statusTextStyle = (connected) => ({
  fontSize: "0.75rem",
  color: connected ? "#4caf50" : "#ff9800",
  fontWeight: "bold",
  marginTop: "2px",
});
const analyzeButtonStyle = (isPro, isConnected) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 14px",
  backgroundColor: "#8a4fff",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "0.8rem",
  fontWeight: "bold",
  cursor: isConnected ? "pointer" : "not-allowed",
  opacity: isConnected ? 1 : 0.5,
  transition: "all 0.3s ease",
});
const chatListStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};
const loadingOverlayStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};
const loadingTextStyle = {
  marginTop: "15px",
  fontWeight: "600",
  color: "#666",
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
});
const bubbleStyle = (sender) => ({
  maxWidth: "75%",
  padding: "12px 16px",
  borderRadius: sender === "me" ? "20px 20px 4px 20px" : "10px",
  backgroundColor: sender === "me" ? "#8a4fff" : "#fff",
  color: sender === "me" ? "#fff" : "#333",
  fontSize: "0.95rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  lineHeight: "1.5",
});
const profileStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "12px",
  backgroundColor: "#e0e0e0",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "0.75rem",
  fontWeight: "bold",
  marginRight: "8px",
};
const inputAreaStyle = {
  padding: "15px 20px 35px",
  backgroundColor: "#fff",
  borderTop: "1px solid #f0f0f0",
};
const inputContainerStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f5f6f8",
  borderRadius: "25px",
  padding: "5px 5px 5px 15px",
};
const disabledInputContainerStyle = { ...inputContainerStyle, opacity: 0.5 };
const inputFieldStyle = {
  flex: 1,
  border: "none",
  background: "none",
  outline: "none",
  fontSize: "0.95rem",
  padding: "10px 0",
};
const sendButtonStyle = (text, connected) => ({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  border: "none",
  background:
    text.trim() && connected
      ? "linear-gradient(135deg, #8a4fff 0%, #6b21ff 100%)"
      : "#f0f0f0",
  cursor: text.trim() && connected ? "pointer" : "default",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
const systemMessageStyle = {
  width: "100%",
  textAlign: "center",
  fontSize: "0.75rem",
  color: "#888",
  backgroundColor: "#f0f0f0",
  padding: "6px 12px",
  borderRadius: "12px",
  margin: "10px 0",
};

export default ChatRoom;
