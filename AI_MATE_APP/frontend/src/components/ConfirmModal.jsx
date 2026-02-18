import React from "react";

const ConfirmModal = ({
  isOpen,
  title = "확인",
  message,
  onConfirm,
  onClose,
  confirmText = "확인", // 💡 호출하는 곳에서 '로그아웃'이나 '결제하기'로 바꿀 수 있음
  cancelText = "취소",
}) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={modalTitleStyle}>{title}</h3>
        <p style={modalMessageStyle}>{message}</p>
        <div style={modalButtonContainerStyle}>
          <button onClick={onClose} style={cancelButtonStyle}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={confirmButtonStyle}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ✨ 세련된 모달 스타일 (MainHome 디자인 시스템 반영) ---

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)", // 배경 어둡게
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 20000, // 최상단 보장
  backdropFilter: "blur(4px)", // 유리 질감 효과
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "30px 25px",
  borderRadius: "28px", // 둥글게
  width: "85%",
  maxWidth: "340px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  animation: "modalFadeIn 0.3s ease-out", // 애니메이션은 CSS 파일에 추가 가능
};

const modalTitleStyle = {
  margin: "0 0 12px 0",
  fontSize: "1.25rem",
  fontWeight: "900",
  color: "#333",
};

const modalMessageStyle = {
  margin: "0 0 30px 0",
  fontSize: "1rem",
  color: "#666",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap", // 줄바꿈(\n) 적용
};

const modalButtonContainerStyle = {
  display: "flex",
  gap: "12px",
};

const cancelButtonStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid #eee",
  backgroundColor: "#f8f9fa",
  color: "#888",
  fontWeight: "700",
  fontSize: "1rem",
  cursor: "pointer",
};

const confirmButtonStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  fontWeight: "700",
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(255, 77, 77, 0.2)",
};

export default ConfirmModal;
