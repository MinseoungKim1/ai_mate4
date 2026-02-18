const userService = require("../services/userService");
const matchService = require("../services/matchService");

// 매칭권 차감 (분석 버튼 클릭 시 호출됨)
exports.useMatchTicket = async (req, res) => {
  try {
    const { email } = req.body;

    // const user = userService.find((u) => u.email === email);
    const user = await userService.getUserByEmail(email);
    if (!user)
      return res
          .status(404)
          .json({success: false, message: "사용자를 찾을 수 없습니다."});

    // PRO 유저라면 차감 없이 성공 반환
    if (user.isPro && !user.proExpiredAt) {
      return res.json({success: true, remainingMatchCount: user.matchCount});
    }

    // 일반 유저는 횟수 확인 후 차감
    if (user.matchCount > 0) {
      const updatedStatus = await userService.useMatchCount(email);
      return res.json({
        success: true,
        message: "매칭권이 차감되었습니다.",
        remainingMatchCount: updatedStatus.matchCount
      });
    } else {
      return res
          .status(400)
          .json({success: false, message: "매칭권이 부족합니다."});
    }
  } catch (error) {
    console.error("매칭권 사용 중 오류 발생:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res
          .status(404)
          .json({success: false, message: "사용자를 찾을 수 없습니다."});
    }

    return res
        .status(500)
        .json({success: false, message: "매칭권 사용 중 오류가 발생했습니다."});
  }
};
