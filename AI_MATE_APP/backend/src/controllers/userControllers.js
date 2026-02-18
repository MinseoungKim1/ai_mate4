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