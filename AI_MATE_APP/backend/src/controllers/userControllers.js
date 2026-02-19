const userService = require("../services/userService");

// 유저 상태 조회
exports.getStatus = async (req, res) => {
  try {
    const { email } = req.body;
    const status = await userService.getUserStatus(email);

    res.status(200).json({
      success: true,
      data: status, // 서비스에서 정리해준 객체를 그대로 전달
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      res
          .status(404)
          .json({ success: false, message: "유저를 찾을 수 없습니다." });
    }
    res
        .status(500)
        .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 일반 매칭권 사용
exports.useMatch = async (req, res) => {
  try {
    const { email } = req.body;
    const updatedStatus = await userService.useMatchCount(email);

    res.status(200).json({
      success: true,
      message: "매칭권 사용 완료",
      data: updatedStatus,
    });
  } catch (error) {
    if (error.message === "NO_MATCH_COUNT") {
      res.status(400).json({ success: false, message: "매칭권이 부족합니다." });
    }
    if (error.message === "USER_NOT_FOUND") {
      res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// AI 매칭권 사용
exports.useAiMatch = async (req, res) => {
  try {
    const { email } = req.body;
    const updatedStatus = await userService.useAiMatchCount(email);

    res.status(200).json({
      success: true,
      message: "AI 매칭권 사용 완료",
      data: updatedStatus,
    });
  } catch (error) {
    if (error.message === "NO_AI_MATCH_COUNT") {
      res.status(400).json({ success: false, message: "AI 매칭권이 부족합니다." });
    }
    if (error.message === "USER_NOT_FOUND") {
      res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

exports.registerUser = async (userData) => {
  const { email, password, nickname } = userData;
  const isExist = users.find((u) => u.email === email);
  if (isExist) throw new Error("ALREADY_EXISTS");

  const newUser = {
    id: Date.now(),
    email,
    password,
    nickname,
    matchCount: 1,
    aiMatchCount: 1,
    isPro: false, // 💡 유료 사용 여부 추가 (기본값: false)
  };
  users.push(newUser);
  return newUser;
};
// 결제 로직
exports.confirmPayment = async (req, res) => {
  try {
    // [LOG] 1. 프론트엔드에서 들어온 바디 전체 확인
    console.log('>>> [Controller] 요청 수신 (req.body):', req.body);

    const { email, planId, nickname } = req.body;

    // 2. 필수 파라미터 체크
    if (!email || !planId || !nickname) {
      console.error('!!! [Controller] 파라미터 누락:', { email, planId, nickname });
      return res.status(400).json({
        success: false,
        message: "필수 파라미터(email, planId, nickname)가 누락되었습니다."
      });
    }

    // [LOG] 3. 서비스 계층으로 데이터 전달 직전 확인
    console.log(`>>> [Controller] 서비스 호출 시도: email=${email}, planId=${planId}`);

    const updatedUser = await userService.processPayment({ email, planId, nickname });

    // [LOG] 6. 서비스 처리가 끝난 후 최종 데이터 확인
    console.log('>>> [Controller] 처리 완료 및 응답 전송:', updatedUser);

    return res.status(200).json({
      success: true,
      message: "결제가 성공적으로 처리되었습니다.",
      data: updatedUser,
    });

  } catch (error) {
    console.error('!!! [Controller] 에러 발생:', error.message);

    const errorMap = {
      "USER_NOT_FOUND": { status: 404, message: "유저를 찾을 수 없습니다." },
      "INVALID_PLAN": { status: 400, message: "유효하지 않은 결제 플랜입니다." }
    };

    const errorDetail = errorMap[error.message];
    if (errorDetail) {
      return res.status(errorDetail.status).json({ success: false, message: errorDetail.message });
    }

    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};