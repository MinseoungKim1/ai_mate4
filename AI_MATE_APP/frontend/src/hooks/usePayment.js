import { useState } from "react";
import axios from "axios";

export const usePayment = () => {
  const [points, setPoints] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 현재 포인트 및 구독 정보 조회
  const fetchBalance = async () => {
    const response = await axios.get(
      "http://localhost:3000/api/payment/balance",
    );
    setPoints(response.data.points);
    setIsSubscribed(response.data.isSubscribed);
  };

  // 매칭 시 포인트 소모 (무료 1회 포함)
  const useMatchingPoint = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/payment/use-match",
      );
      if (response.data.success) {
        setPoints(response.data.remainingPoints);
        return true;
      }
    } catch (err) {
      alert(err.response.data.message || "포인트가 부족합니다.");
      return false;
    }
  };

  // 포인트 충전 요청
  const rechargePoints = async (planId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/payment/recharge",
        { planId },
      );
      alert("결제가 완료되었습니다!");
      await fetchBalance(); // 잔액 갱신
    } catch (err) {
      alert("결제 중 오류가 발생했습니다.");
    }
  };

  return {
    points,
    isSubscribed,
    fetchBalance,
    useMatchingPoint,
    rechargePoints,
  };
};
