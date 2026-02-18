import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPromptModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={overlayStyle}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={modalStyle}
          >
            <div style={iconStyle}>🔒</div>
            <h2 style={titleStyle}>로그인이 필요합니다</h2>
            <p style={descStyle}>
              해당 서비스는 회원 전용입니다.
              <br />
              로그인 후 더 많은 혜택을 누려보세요!
            </p>
            <button onClick={onClose} style={buttonStyle}>
              확인
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- 스타일 정의 ---
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};
const modalStyle = {
  width: "300px",
  backgroundColor: "#fff",
  borderRadius: "24px",
  padding: "30px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};
const iconStyle = { fontSize: "3rem", marginBottom: "15px" };
const titleStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "10px",
};
const descStyle = {
  fontSize: "0.9rem",
  color: "#666",
  lineHeight: "1.5",
  marginBottom: "20px",
};
const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default LoginPromptModal;
