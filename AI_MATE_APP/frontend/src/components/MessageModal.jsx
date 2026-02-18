import React from "react";

const MessageModal = ({ isOpen, title = "안내", message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={statusIconStyle}>❕</div>
        <h3 style={modalTitleStyle}>{title}</h3>
        <p style={modalMessageStyle}>{message}</p>
        <button style={confirmButtonStyle} onClick={onClose}>
          확인했습니다
        </button>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
  backdropFilter: "blur(5px)", // 배경 블러 처리
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "40px 30px",
  borderRadius: "30px",
  width: "85%",
  maxWidth: "340px",
  textAlign: "center",
  boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
};

const statusIconStyle = {
  fontSize: "2.5rem",
  marginBottom: "15px",
  color: "#ff4d4d",
};

const modalTitleStyle = {
  margin: "0 0 10px 0",
  fontSize: "1.2rem",
  color: "#333",
  fontWeight: "800",
};
const modalMessageStyle = {
  margin: "0 0 30px 0",
  fontSize: "1rem",
  color: "#666",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap",
};

const confirmButtonStyle = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "20px",
  backgroundColor: "#333",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background 0.3s",
};

export default MessageModal;
