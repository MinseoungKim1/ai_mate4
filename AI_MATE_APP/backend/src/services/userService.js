const { User } = require("../models");

// 1. 공통 유저 조회 함수
exports.getUserByEmail = async (email) => {
  // const user = users.find((u) => u.email === email);
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
};

// 2. 유저의 현재 모든 상태 데이터 요약 정보 반환
exports.getUserStatus = async (email) => {
  const user = await this.getUserByEmail(email);
  return {
    matchCount: user.matchCount,
    aiMatchCount: user.aiMatchCount,
    isPro: user.isPro,
    nickname: user.nickname,
  };
};

// ==================== 매칭권 차감 로직 ====================

// 3. 일반 매칭권 차감 로직
exports.useMatchCount = async (email) => {
  const user = await this.getUserByEmail(email);

  // 💡 PRO 유저라면 차감 없이 현재 상태 반환
  if (user.isPro) {
    return this.getUserStatus(email);
  }

  if (user.matchCount <= 0) throw new Error("NO_MATCH_COUNT");

  await user.decrement("matchCount", { by: 1 });
  await user.reload();
  return this.getUserStatus(email);
};

// 4. AI 매칭권 차감 로직
exports.useAiMatchCount = async (email) => {
  const user = await this.getUserByEmail(email);

  // 💡 PRO 유저라면 차감 없이 현재 상태 반환
  if (user.isPro) {
    return this.getUserStatus(email);
  }

  if (user.aiMatchCount <= 0) throw new Error("NO_AI_MATCH_COUNT");

  await user.decrement("aiMatchCount", { by: 1 });
  await user.reload();
  return this.getUserStatus(email);
};

// ==================== 매칭권 증가 로직 ====================

// 5. 일반 매칭권 추가
exports.addMatchCount = async (email, amount = 1) => {
  const user = await this.getUserByEmail(email);
  await user.increment('matchCount', { by: amount });
  await user.reload();
  return this.getUserStatus(email);
};

// 6. AI 매칭권 추가
exports.addAiMatchCount = async (email, amount = 1) => {
  const user = await this.getUserByEmail(email);
  await user.increment('aiMatchCount', { by: amount });
  await user.reload();
  return this.getUserStatus(email);
};

// ==================== 유저 정보 업데이트 ====================

// 7. 유저 프로필 업데이트
exports.updateUserProfile = async (email, updateData) => {
  const user = await this.getUserByEmail(email);

  // 업데이트 가능한 필드만 추출
  const allowedFields = ['nickname', 'gender', 'age'];
  const filteredData = {};

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  await user.update(filteredData);
  return user;
};

// 8. 프로 구독 설정
exports.setProStatus = async (email, isPro, expiredAt = null) => {
  const user = await this.getUserByEmail(email);
  await user.update({
    isPro,
    proExpiredAt: expiredAt
  });
  await user.reload();
  return this.getUserStatus(email);
};

// 9. 크레딧 추가/차감
exports.updateCredit = async (email, amount) => {
  const user = await this.getUserByEmail(email);

  if (amount > 0) {
    await user.increment('credit', { by: amount });
  } else {
    const newCredit = user.credit + amount; // amount는 음수
    if (newCredit < 0) {
      throw new Error("INSUFFICIENT_CREDIT");
    }
    await user.decrement('credit', { by: Math.abs(amount) });
  }

  await user.reload();
  return this.getUserStatus(email);
};

// ==================== 유틸리티 함수 ====================

// 10. 모든 유저 조회 (관리자용)
exports.getAllUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ['password'] }, // 비밀번호 제외
    order: [['createdAt', 'DESC']]
  });
};

// 11. 유저 존재 여부 확인
exports.checkUserExists = async (email) => {
  const user = await User.findOne({ where: { email } });
  return !!user; // boolean 반환
};

// 12. 유저 삭제 (회원 탈퇴)
exports.deleteUser = async (email) => {
  const user = await this.getUserByEmail(email);
  await user.destroy();
  return { success: true, message: "User deleted" };
};
