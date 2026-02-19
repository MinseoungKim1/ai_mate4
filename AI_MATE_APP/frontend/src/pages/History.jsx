import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ChevronLeft,
  MessageSquare,
  History as HistoryIcon,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import ConfirmModal from "../components/ConfirmModal";
import { API_URL } from "../config";

const History = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    targetId: null,
  });

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setLoading(true);
        const userEmail = localStorage.getItem("userEmail");
        const response = await fetch(`${API_URL}/api/history/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json());

        if (response.success) {
          setHistoryList(response.data);
        }
      } catch (error) {
        console.error("로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistories();
  }, []);

  const handleCardClick = (item) => {
    if (!isDragging) {
      // 💡 전용 열람 페이지인 /history/chat 으로 이동
      navigate(`/history/chat?id=${item.id}&partner=${item.partner}`);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const id = deleteModal.targetId;
      const response = await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
      }).then((res) => res.json());

      if (response.success) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      alert("삭제 중 오류 발생");
    } finally {
      setDeleteModal({ isOpen: false, targetId: null });
    }
  };

  if (loading) {
    return (
      <div style={outerWrapperStyle}>
        <div style={containerStyle}>
          <div style={emptyContainerStyle}>기록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={outerWrapperStyle}>
      <div style={containerStyle}>
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="대화 삭제"
          message={`이 대화 기록을 정말 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.`}
          confirmText="삭제하기"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteModal({ isOpen: false, targetId: null })}
        />

        <header style={headerStyle}>
          <button onClick={() => navigate("/home")} style={backBtnStyle}>
            <ChevronLeft size={28} color="#333" />
          </button>
          <h3 style={headerTitleStyle}>대화 기록</h3>
          <div style={{ width: "28px" }}></div>
        </header>

        <div style={listScrollStyle}>
          <AnimatePresence>
            {historyList.length > 0 ? (
              historyList.map((item) => (
                <div key={item.id} style={cardWrapperStyle}>
                  <div
                    style={behindDeleteActionStyle}
                    onClick={() =>
                      setDeleteModal({ isOpen: true, targetId: item.id })
                    }
                  >
                    <Trash2 size={22} color="#fff" />
                    <span style={deleteTextStyle}>삭제</span>
                  </div>

                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -75, right: 0 }}
                    dragElastic={0.1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
                    whileTap={{ scale: 0.98 }}
                    style={historyCardStyle}
                    onClick={() => handleCardClick(item)}
                  >
                    <div style={cardHeaderStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={partnerInfoWrapper}>
                          <MessageSquare
                            size={16}
                            color={
                              item.chatType === "ai" ? "#ff4d4d" : "#8a4fff"
                            }
                            style={{ marginRight: "6px" }}
                          />
                          <h4 style={partnerNameStyle}>
                            {item.partner}님과의 대화
                            <span style={typeTagStyle(item.chatType)}>
                              {item.chatType === "ai" ? "AI" : "User"}
                            </span>
                          </h4>
                        </div>
                        <p style={dateTextStyle}>{item.date}</p>
                      </div>
                      <div style={scoreBadgeStyle}>{item.score}점</div>
                    </div>

                    <div style={tagContainerStyle}>
                      {item.tags.map((tag) => (
                        <span key={tag} style={miniTagStyle}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ))
            ) : (
              <div style={emptyContainerStyle}>
                <HistoryIcon
                  size={60}
                  color="#eee"
                  style={{ marginBottom: "15px" }}
                />
                <p style={emptyTextStyle}>아직 대화 기록이 없어요.</p>
                <button
                  onClick={() => navigate("/home")}
                  style={goHomeButtonStyle}
                >
                  첫 대화 시작하기
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

// 스타일은 기존과 동일하므로 생략 (그대로 사용하시면 됩니다)
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
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  position: "relative",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #f8f9fa",
  backgroundColor: "#fff",
};
const headerTitleStyle = {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "#333",
};
const listScrollStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  backgroundColor: "#fbfcfd",
};
const cardWrapperStyle = {
  position: "relative",
  marginBottom: "16px",
  borderRadius: "24px",
  backgroundColor: "transparent", // ✅ 빨간 잔상을 없애기 위해 투명하게 변경
  overflow: "hidden",
};
const behindDeleteActionStyle = {
  position: "absolute",
  right: "10px", // ✅ 우측 여백 추가
  top: "12px",   // ✅ 상단 여백 추가
  bottom: "12px", // ✅ 하단 여백 추가
  width: "65px",  // ✅ 너비 약간 축소
  backgroundColor: "#ff4d4d",
  borderRadius: "16px", // ✅ 크기에 맞춰 둥근 모서리 조정
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  color: "#fff",
  zIndex: 0,
};
const deleteTextStyle = {
  fontSize: "0.7rem",
  fontWeight: "bold",
  marginTop: "4px",
};
const historyCardStyle = {
  backgroundColor: "#fff",
  padding: "22px 20px",
  borderRadius: "24px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  cursor: "pointer",
  border: "1px solid #eee", // ✅ 보더 색상을 약간 더 연하게 조정
  position: "relative",
  zIndex: 1,
};
const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};
const partnerInfoWrapper = {
  display: "flex",
  alignItems: "center",
  marginBottom: "4px",
};
const partnerNameStyle = {
  margin: 0,
  fontSize: "1.05rem",
  fontWeight: "700",
  color: "#333",
  display: "flex",
  alignItems: "center",
};
const typeTagStyle = (type) => ({
  fontSize: "0.65rem",
  padding: "2px 6px",
  borderRadius: "6px",
  marginLeft: "8px",
  backgroundColor: type === "ai" ? "#fff0f0" : "#f0f0ff",
  color: type === "ai" ? "#ff4d4d" : "#8a4fff",
  border: `1px solid ${type === "ai" ? "#ffdada" : "#dadaff"}`,
});
const dateTextStyle = {
  fontSize: "0.8rem",
  color: "#bbb",
  margin: 0,
  paddingLeft: "22px",
};
const scoreBadgeStyle = {
  color: "#ff4d4d",
  fontWeight: "900",
  fontSize: "1.2rem",
};
const tagContainerStyle = {
  display: "flex",
  gap: "8px",
  marginTop: "14px",
  paddingLeft: "22px",
};
const miniTagStyle = {
  fontSize: "0.75rem",
  color: "#777",
  backgroundColor: "#f0f2f5",
  padding: "5px 10px",
  borderRadius: "10px",
  fontWeight: "600",
};
const backBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
};
const emptyContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "#bbb",
};
const emptyTextStyle = { fontSize: "1rem", marginBottom: "20px" };
const goHomeButtonStyle = {
  padding: "12px 24px",
  borderRadius: "15px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default History;
