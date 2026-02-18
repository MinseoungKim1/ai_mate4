import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Check, AlertTriangle, ArrowRight } from "lucide-react";

const ProModal = ({ isOpen, onClose, onUpgrade }) => {
  // 💡 내부 상태: false면 혜택 안내, true면 이동 확인 화면
  const [isConfirming, setIsConfirming] = useState(false);

  // 모달 닫을 때 상태 초기화
  const handleClose = () => {
    setIsConfirming(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={overlayStyle}>
          <div style={backdropStyle} onClick={handleClose} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={modalStyle}
          >
            <button onClick={handleClose} style={closeButtonStyle}>
              <X size={20} color="#aaa" />
            </button>

            {!isConfirming ? (
              /* --- 1단계: 혜택 안내 화면 --- */
              <motion.div
                key="info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div style={iconWrapperStyle}>
                  <Zap size={32} color="#fff" fill="#fff" />
                </div>

                <h2 style={titleStyle}>
                  AI 분석은 <span style={highlightStyle}>PRO</span> 전용입니다
                </h2>
                <p style={descStyle}>
                  지금 업그레이드하고 실시간으로 대화 스킬과
                  <br />
                  상대방의 호감도 리포트를 확인하세요!
                </p>

                <div style={benefitListStyle}>
                  <div style={benefitItemStyle}>
                    <Check
                      size={16}
                      color="#8a4fff"
                      style={{ marginRight: "8px" }}
                    />
                    실시간 대화 흐름 분석
                  </div>
                  <div style={benefitItemStyle}>
                    <Check
                      size={16}
                      color="#8a4fff"
                      style={{ marginRight: "8px" }}
                    />
                    맞춤형 답장 큐레이션
                  </div>
                  <div style={benefitItemStyle}>
                    <Check
                      size={16}
                      color="#8a4fff"
                      style={{ marginRight: "8px" }}
                    />
                    무제한 대화 기록 저장
                  </div>
                </div>

                <button
                  onClick={() => setIsConfirming(true)}
                  style={upgradeButtonStyle}
                >
                  결제 페이지로 이동하기
                </button>
                <p style={footerStyle}>
                  프리미엄 혜택으로 더 성공적인 대화를 시작해보세요.
                </p>
              </motion.div>
            ) : (
              /* --- 2단계: 💡 이동 확인 화면 (기존 alert 대체) --- */
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div style={warningIconStyle}>
                  <AlertTriangle size={32} color="#ff4d4d" />
                </div>

                <h2 style={titleStyle}>잠깐만요!</h2>
                <p style={descStyle}>
                  결제 페이지로 이동하시면
                  <br />
                  <strong>현재 진행 중인 대화가 종료</strong>됩니다.
                  <br />
                  정말 이동하시겠습니까?
                </p>

                <div style={buttonGroupStyle}>
                  <button
                    onClick={() => setIsConfirming(false)}
                    style={cancelButtonStyle}
                  >
                    돌아가기
                  </button>
                  <button onClick={onUpgrade} style={confirmExitButtonStyle}>
                    이동하기{" "}
                    <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                  </button>
                </div>
              </motion.div>
            )}
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
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  padding: "20px",
};
const backdropStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
};
const modalStyle = {
  width: "100%",
  maxWidth: "340px",
  backgroundColor: "#fff",
  borderRadius: "32px",
  padding: "40px 24px 32px",
  textAlign: "center",
  position: "relative",
  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  overflow: "hidden",
};
const closeButtonStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  border: "none",
  background: "none",
  cursor: "pointer",
  zIndex: 10,
};
const iconWrapperStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "22px",
  background: "linear-gradient(135deg, #8a4fff 0%, #6b21ff 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto 24px",
};
const titleStyle = {
  fontSize: "1.4rem",
  fontWeight: "900",
  marginBottom: "12px",
  color: "#222",
};
const highlightStyle = { color: "#8a4fff" };
const descStyle = {
  fontSize: "0.95rem",
  color: "#666",
  lineHeight: "1.6",
  marginBottom: "28px",
};
const benefitListStyle = {
  backgroundColor: "#f9f8ff",
  borderRadius: "20px",
  padding: "20px",
  marginBottom: "24px",
  textAlign: "left",
  border: "1px solid #eeebff",
};
const benefitItemStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "0.85rem",
  color: "#444",
  marginBottom: "10px",
  fontWeight: "700",
};
const upgradeButtonStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "16px",
  border: "none",
  background: "#222",
  color: "#fff",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  marginBottom: "12px",
};
const footerStyle = { fontSize: "0.75rem", color: "#aaa", fontWeight: "500" };

// 💡 2단계 전용 스타일
const warningIconStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "22px",
  backgroundColor: "#fff0f0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto 24px",
};
const buttonGroupStyle = { display: "flex", gap: "10px", marginTop: "10px" };
const cancelButtonStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #eee",
  backgroundColor: "#fff",
  color: "#666",
  fontWeight: "700",
  cursor: "pointer",
};
const confirmExitButtonStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "14px",
  border: "none",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default ProModal;
