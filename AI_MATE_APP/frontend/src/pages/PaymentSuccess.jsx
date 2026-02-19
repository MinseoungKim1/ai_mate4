import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, PartyPopper } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [timeLeft, setTimeLeft] = useState(5);
  const [isUpdating, setIsUpdating] = useState(true);

  const orderName = searchParams.get("orderName") || "상품";
  const planId = searchParams.get("planId");

  // 1. 데이터 업데이트 전용 useEffect
  useEffect(() => {
    const updateUserData = async () => {
      const nickname = localStorage.getItem("nickname");
      const userEmail = localStorage.getItem("userEmail");
      console.log('nickname',nickname);
      console.log('planId',planId);
      console.log('userEmail',userEmail);
      
      if (!planId) return;

      try {
        const response = await fetch("/api/user/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: planId,
            nickname: nickname,
            userEmail: userEmail,
          }),
        });
        console.log('response',response);

        if (!response.ok) throw new Error("결제 정보 업데이트 실패");
        
        setIsUpdating(false);
      } catch (error) {
        console.error("DB 업데이트 실패:", error);
        alert("결제 처리에 실패했습니다. 고객센터에 문의하세요.");
      }
    };

    updateUserData();
  }, [planId]); // planId가 있을 때 한 번만 실행

  // 2. 타이머 및 페이지 이동 전용 useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/home", { replace: true }); // replace로 뒤로가기 방지
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleClose = () => {
    navigate("/home", { replace: true });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={iconWrapperStyle}>
          <PartyPopper size={40} color="#fff" />
        </div>
        
        <h2 style={titleStyle}>결제 완료!</h2>
        <p style={descStyle}>
          <strong>{orderName}</strong> 적용이 완료되었습니다.<br />
          이제 모든 프리미엄 기능을 사용하실 수 있습니다.
        </p>

        <div style={infoBoxStyle}>
          {isUpdating ? (
            <p style={{ fontSize: "0.9rem", color: "#888" }}>정보를 업데이트 중입니다...</p>
          ) : (
            <>
              <div style={infoItemStyle}>
                <CheckCircle2 size={16} color="#4bb543" />
                <span>아이템 즉시 지급 완료</span>
              </div>
              <div style={infoItemStyle}>
                <CheckCircle2 size={16} color="#4bb543" />
                <span>프리미엄 권한 활성화</span>
              </div>
            </>
          )}
        </div>

        <button onClick={handleClose} style={confirmButtonStyle}>
          확인 ( {timeLeft}초 후 자동 이동 )
        </button>
      </div>
    </div>
  );
};

// ... 스타일 정의는 동일하게 유지 ...
// --- 스타일 정의 ---
const overlayStyle = {
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f0f2f5",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px"
};

const modalStyle = {
  width: "100%",
  maxWidth: "400px",
  backgroundColor: "#fff",
  borderRadius: "30px",
  padding: "40px 30px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const iconWrapperStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#ff4d4d",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "20px",
  boxShadow: "0 8px 16px rgba(255, 77, 77, 0.3)"
};

const titleStyle = {
  fontSize: "1.6rem",
  fontWeight: "900",
  color: "#333",
  margin: "0 0 10px 0"
};

const descStyle = {
  fontSize: "1rem",
  color: "#666",
  lineHeight: "1.6",
  marginBottom: "25px"
};

const infoBoxStyle = {
  width: "100%",
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "30px"
};

const infoItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "0.9rem",
  color: "#555",
  margin: "5px 0"
};

const confirmButtonStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "none",
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "1.1rem",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s"
};

export default PaymentSuccess;