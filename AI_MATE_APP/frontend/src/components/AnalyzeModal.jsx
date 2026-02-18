import React from "react";

const AnalyzeModal = ({ isOpen, onClose, onConfirm, turnCount }) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={iconCircleStyle}>📊</div>
        <h3 style={modalTitleStyle}>연애 점수 분석</h3>
        <p style={modalTextStyle}>
          현재까지 <strong>{turnCount}번</strong>의 대화를 나눴습니다.
          <br />
          분석을 시작하면 대화가 종료되고 결과 페이지로 이동합니다.
          계속하시겠습니까?
        </p>
        <div style={modalButtonContainerStyle}>
          <button onClick={onClose} style={cancelButtonStyle}>
            취소
          </button>
          <button onClick={onConfirm} style={confirmButtonStyle}>
            분석 시작
          </button>
        </div>
      </div>
    </div>
  );
};

// 모달 스타일 정의
const modalOverlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  backdropFilter: "blur(2px)",
};

const modalContentStyle = {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: "20px",
  padding: "25px 20px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  animation: "fadeIn 0.3s ease-out",
};

const iconCircleStyle = {
  fontSize: "2rem",
  marginBottom: "15px",
};

const modalTitleStyle = {
  margin: "0 0 10px 0",
  fontSize: "1.2rem",
  color: "#333",
  fontWeight: "bold",
};
const modalTextStyle = {
  fontSize: "0.95rem",
  color: "#666",
  lineHeight: "1.6",
  marginBottom: "25px",
};
const modalButtonContainerStyle = { display: "flex", gap: "10px" };

const cancelButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #eee",
  backgroundColor: "#f5f5f5",
  cursor: "pointer",
  fontWeight: "bold",
  color: "#666",
};

const confirmButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

export default AnalyzeModal;
