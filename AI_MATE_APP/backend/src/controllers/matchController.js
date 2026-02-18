const { users } = require("../services/userService");

// 매칭권 차감 (분석 버튼 클릭 시 호출됨)
exports.useMatchTicket = (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "사용자를 찾을 수 없습니다." });

  // PRO 유저라면 차감 없이 성공 반환
  if (user.isPro) {
    return res.json({ success: true, remainingMatchCount: user.matchCount });
  }

  // 일반 유저는 횟수 확인 후 차감
  if (user.matchCount > 0) {
    user.matchCount -= 1;
    return res.json({ success: true, remainingMatchCount: user.matchCount });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "매칭권이 부족합니다." });
  }
};
