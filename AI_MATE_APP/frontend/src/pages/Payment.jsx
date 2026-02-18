import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk"; 
import { ChevronLeft, CheckCircle2, Crown, Ticket } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

const Payment = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plans = [
    {
      id: 1,
      name: "1회 통합 매칭권",
      price: "2,900원",
      desc: "실시간 매칭 1회 + AI 대화 1회 충전", // '충전' 키워드 강조
      icon: <Ticket size={28} color="#ff4d4d" />,
    },
    {
      id: 2,
      name: "프리미엄 구독 1개월",
      price: "19,900원",
      desc: "무제한 AI 분석 + 매일 무료 매칭 3회",
      icon: <Crown size={28} color="#ff4d4d" />,
      best: true,
    },
     {
      id: 3,
      name: "테스트입니다.",
      price: "1원",
      desc: "무제한 AI 분석 + 매일 무료 매칭 3회",
      icon: <Crown size={28} color="#ff4d4d" />,
      best: true,
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan);

  const handleConfirmPayment = async () => {
  setIsModalOpen(false);
  const clientKey = "test_ck_6BYq7GWPVvGDyz6BAXZ7rNE5vbo1";
  
  try {
    const tossPayments = await loadTossPayments(clientKey);
    const payment = tossPayments.payment({
      customerKey: "ANONYMOUS", 
    });

    console.log(`${currentPlan.name} 결제창 호출`);

    // 이 함수가 실행되면 브라우저는 토스의 결제 대기 화면(사진에서 보신 화면)으로 넘어갑니다.
    await payment.requestPayment({
      method: "CARD", 
      amount: {
        currency: "KRW",
        value: parseInt(currentPlan.price.replace(/[^0-9]/g, "")),
      },
      orderId: `order_${Math.random().toString(36).slice(2, 11)}`,
      orderName: currentPlan.name,
      successUrl: `${window.location.origin}/payment-success`, // 성공 시 갈 곳
      failUrl: `${window.location.origin}/payment-fail`,       // 실패 시 갈 곳
      customerName: localStorage.getItem("nickname") || "익명고객",
    });

    // 💡 중요: 결제 성공 시 위 라인에서 페이지가 '리다이렉트'되므로 
    // 이 아래 줄 코드는 절대 실행되지 않습니다!

  } catch (error) {
    if (error.code === "USER_CANCEL") {
      alert("결제를 취소하셨습니다.");
    } else {
      console.error("결제 요청 중 에러:", error);
      alert("결제 준비 중 오류가 발생했습니다.");
    }
  }
};
  return (
    <div style={outerWrapperStyle}>
      <div style={appContainerStyle}>
        {/* 결제 확인 모달 */}
        <ConfirmModal
          isOpen={isModalOpen}
          title="결제 확인"
          message={`선택하신 [${currentPlan?.name}] 상품을\n결제하시겠습니까?`}
          onConfirm={handleConfirmPayment}
          onClose={() => setIsModalOpen(false)}
          confirmText="결제하기"
        />

        {/* 상단 헤더 - 💡 navigate("/home")으로 수정됨 */}
        <header style={headerStyle}>
          <button onClick={() => navigate("/home")} style={backBtnStyle}>
            <ChevronLeft size={28} color="#333" />
          </button>
          <h3 style={headerTitleStyle}>멤버십 결제</h3>
          <div style={{ width: "28px" }}></div>
        </header>

        <div style={contentStyle}>
          <div style={topInfoStyle}>
            <h2 style={titleStyle}>
              더 특별한 인연을 위해
              <br />
              메이트를 업그레이드 하세요
            </h2>
            <p style={subTitleStyle}>
              전문적인 AI 코칭이 당신의 연애를 도와드려요.
            </p>
          </div>

          <div style={planListStyle}>
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={planCardStyle(isSelected, plan.best)}
                >
                  {plan.best && <span style={bestBadgeStyle}>BEST</span>}
                  <div style={planIconStyle}>{plan.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={planNameStyle(isSelected)}>{plan.name}</h4>
                    <p style={planDescStyle}>{plan.desc}</p>
                    <div style={planPriceStyle}>{plan.price}</div>
                  </div>
                  <div style={radioButtonStyle(isSelected)}>
                    {isSelected && <div style={radioInnerStyle} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={benefitBoxStyle}>
            <div style={benefitItemStyle}>
              <CheckCircle2
                size={16}
                color="#ff4d4d"
                style={{ marginRight: "8px" }}
              />
              <span>실시간 AI 연애 코칭 무제한</span>
            </div>
            <div style={benefitItemStyle}>
              <CheckCircle2
                size={16}
                color="#ff4d4d"
                style={{ marginRight: "8px" }}
              />
              <span>매일 정오 무료 매칭 리필</span>
            </div>
            <div style={benefitItemStyle}>
              <CheckCircle2
                size={16}
                color="#ff4d4d"
                style={{ marginRight: "8px" }}
              />
              <span>광고 없는 쾌적한 대화 환경</span>
            </div>
          </div>
        </div>

        {/* 하단 결제 버튼 */}
        <div style={bottomAreaStyle}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={primaryButtonStyle}
          >
            {currentPlan?.price} 결제하기
          </button>
          <p style={noticeTextStyle}>
            구독은 언제든지 마이페이지에서 해지 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 (기존과 동일) ---
const outerWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f0f2f5",
};
const appContainerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "95vh",
  backgroundColor: "#fff",
  borderRadius: "30px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #f8f9fa",
};
const headerTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "#333",
};
const contentStyle = { flex: 1, padding: "30px 25px", overflowY: "auto" };
const topInfoStyle = { marginBottom: "35px" };
const titleStyle = {
  fontSize: "1.4rem",
  fontWeight: "900",
  color: "#333",
  lineHeight: "1.4",
  margin: "0 0 10px 0",
};
const subTitleStyle = { fontSize: "0.9rem", color: "#aaa" };
const planListStyle = { display: "flex", flexDirection: "column", gap: "16px" };
const planCardStyle = (isSelected, isBest) => ({
  display: "flex",
  alignItems: "center",
  padding: "24px 20px",
  borderRadius: "24px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  position: "relative",
  border: `2px solid ${isSelected ? "#ff4d4d" : "#f0f0f0"}`,
  backgroundColor: isSelected ? "#fffafb" : "#fff",
  transform: isSelected ? "scale(1.02)" : "scale(1)",
});
const bestBadgeStyle = {
  position: "absolute",
  top: "-10px",
  right: "20px",
  backgroundColor: "#ff4d4d",
  color: "white",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "bold",
};
const planIconStyle = {
  marginRight: "15px",
  display: "flex",
  alignItems: "center",
};
const planNameStyle = (isSelected) => ({
  margin: "0 0 4px 0",
  fontSize: "1.1rem",
  fontWeight: "bold",
  color: isSelected ? "#ff4d4d" : "#333",
});
const planDescStyle = {
  fontSize: "0.85rem",
  color: "#999",
  margin: "0 0 8px 0",
};
const planPriceStyle = { fontSize: "1.2rem", fontWeight: "900", color: "#333" };
const radioButtonStyle = (isSelected) => ({
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  border: `2px solid ${isSelected ? "#ff4d4d" : "#ddd"}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
const radioInnerStyle = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  backgroundColor: "#ff4d4d",
};
const benefitBoxStyle = {
  marginTop: "35px",
  padding: "20px",
  borderRadius: "20px",
  backgroundColor: "#fbfcfd",
  border: "1px solid #f0f0f0",
};
const benefitItemStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "0.85rem",
  color: "#666",
  margin: "10px 0",
};
const bottomAreaStyle = { padding: "20px 25px 40px" };
const primaryButtonStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "none",
  background: "linear-gradient(135deg, #ff6b6b 0%, #ff4d4d 100%)",
  color: "white",
  fontWeight: "800",
  fontSize: "1.1rem",
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(255, 77, 77, 0.2)",
};
const noticeTextStyle = {
  textAlign: "center",
  fontSize: "0.75rem",
  color: "#bbb",
  marginTop: "15px",
};
const backBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
};

export default Payment;
