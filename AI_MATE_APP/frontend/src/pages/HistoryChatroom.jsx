import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { API_URL } from "../config";

const HistoryChatRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const chatId = query.get("id");
  const partnerName = query.get("partner") || "대화 상대";

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // 1. 대화 상세 내역 서버에서 가져오기
  useEffect(() => {
    const fetchChatDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/history/detail/${chatId}`,
        ).then((res) => res.json());

        if (response.success) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("내역 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) fetchChatDetail();
  }, [chatId]);

  // 2. 스크롤 하단 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={outerWrapperStyle}>
      <div style={containerStyle}>
        {/* 상단 헤더 */}
        <header style={headerStyle}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            <ChevronLeft size={24} color="#333" />
          </button>
          <div style={headerTitleStyle}>{partnerName}님과의 기록</div>
          <div style={{ width: 40 }} /> {/* 밸런스용 */}
        </header>

        {/* 채팅 리스트 영역 (입력창 없음) */}
        <div style={chatListStyle} ref={scrollRef}>
          {loading ? (
            <div style={statusTextStyle}>기록을 불러오는 중...</div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} style={messageWrapperStyle(msg.sender)}>
                {(msg.sender === "mate" || msg.sender === "other") && (
                  <div style={profileStyle(msg.sender)}>
                    {msg.sender === "mate" ? "M" : "P"}
                  </div>
                )}
                <div style={bubbleStyle(msg.sender)}>{msg.text}</div>
              </div>
            ))
          ) : (
            <div style={statusTextStyle}>대화 내용이 없습니다.</div>
          )}
          <div style={endOfRecordStyle}>— 대화 기록의 끝입니다 —</div>
        </div>
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
const headerTitleStyle = { fontWeight: "800", fontSize: "1rem", color: "#333" };
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
});
const bubbleStyle = (sender) => ({
  maxWidth: "75%",
  padding: "12px 16px",
  borderRadius: sender === "me" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
  backgroundColor:
    sender === "system" ? "#eee" : sender === "me" ? "#8a4fff" : "#fff",
  color: sender === "me" ? "#fff" : "#333",
  fontSize: sender === "system" ? "0.75rem" : "0.95rem",
  fontWeight: sender === "system" ? "600" : "500",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  lineHeight: "1.5",
});
const profileStyle = (sender) => ({
  width: "32px",
  height: "32px",
  borderRadius: "12px",
  backgroundColor: sender === "mate" ? "#ff4d4d" : "#e0e0e0",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "0.75rem",
  fontWeight: "bold",
  marginRight: "8px",
});
const statusTextStyle = {
  textAlign: "center",
  color: "#aaa",
  fontSize: "0.9rem",
  marginTop: "50px",
};
const endOfRecordStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#333", // 💡 더 진한 검은색 톤으로 변경
  fontSize: "0.8rem", // 💡 글자 크기 살짝 키움
  margin: "40px 0 20px",
  fontWeight: "700", // 💡 굵게 설정
  gap: "10px", // 선과 글자 사이 간격
};
const dividerStyle = {
  flex: 1,
  height: "1px",
  backgroundColor: "#ddd", // 옅은 회색 선
};

export default HistoryChatRoom;
