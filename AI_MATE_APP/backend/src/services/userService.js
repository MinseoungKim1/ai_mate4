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

// 1. 상품 플랜 정책 (PLAN_POLICIES의 필드명을 아래 로직과 일치시켰습니다)
const PLAN_POLICIES = {
  1: {
    type: "TICKET",
    matchCount: 1,      // 추가될 일반 매칭권
    aiMatchCount: 1,    // 추가될 AI 매칭권
    description: "1회 통합 매칭권"
  },
  2: {
    type: "PRO",
    matchCount: 3,      // 추가될 일반 매칭권
    aiMatchCount: 3,    // 추가될 AI 매칭권
    description: "프리미엄 구독 1개월"
  },
  3: {
    type: "PRO",
    matchCount: 3,      // 추가될 일반 매칭권
    aiMatchCount: 3,    // 추가될 AI 매칭권
    description: "테스트 1원 결제"
  },
};

// 2. 결제 후 처리 로직
exports.processPayment = async ({ email, planId, nickname }) => {
  // [LOG] 1. 서비스 진입 및 입력 파라미터 확인
  console.log(`\n[Service] >>> processPayment 시작: email=${email}, planId=${planId}, nickname=${nickname}`);

  // 1. 유저 확인
  const user = await this.getUserByEmail(email);
  if (!user) {
    console.error(`[Service] !!! 에러: 유저를 찾을 수 없음 (${email})`);
    throw new Error("USER_NOT_FOUND");
  }
  console.log(`[Service] 1. 유저 조회 성공: DB 닉네임=${user.nickname}`);

  // 닉네임 불일치 체크 (경고만 노출)
  if (user.nickname !== nickname) {
    console.warn(`[Service] [Warning] 닉네임 불일치: 요청(${nickname}) vs DB(${user.nickname})`);
  }

  // 2. 플랜 정책 가져오기
  const plan = PLAN_POLICIES[planId];
  if (!plan) {
    console.error(`[Service] !!! 에러: 유효하지 않은 플랜 ID (${planId})`);
    throw new Error("INVALID_PLAN");
  }
  console.log(`[Service] 2. 플랜 정책 확인: 타입=${plan.type}, 설명=${plan.description}`);

  // 3. 플랜 타입에 따라 처리
  if (plan.type === "TICKET") {
    console.log(`[Service] 3-1. TICKET 처리 시작: matchCount+=${plan.matchCount}, aiMatchCount+=${plan.aiMatchCount}`);

    await this.addMatchCount(email, plan.matchCount);
    await this.addAiMatchCount(email, plan.aiMatchCount);

  } else if (plan.type === "PRO") {
    // [PRO 구독 처리]
    const expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() + (plan.months || 1));

    // [LOG] 업데이트 직전 값 확인
    console.log(`[Service] 3-2. PRO 처리 시작: is_pro=true, match_count=3, ai_match_count=3, 만료일=${expiredAt.toISOString()}`);

    // 유저 테이블 업데이트
    await user.update({
      is_pro: true,
      pro_expired_at: expiredAt,
      match_count: 3,            // 요구사항: 3으로 고정
      ai_match_count: 3          // 요구사항: 3으로 고정
    });

    console.log(`[Service] [Success] ${email} DB 업데이트 완료 (is_pro: true)`);
  }

  // 4. 최종 업데이트된 유저 상태 반환
  console.log(`[Service] 4. 데이터 리로드 및 최종 상태 조회 중...`);
  await user.reload();
  const status = await this.getUserStatus(email);

  console.log(`[Service] <<< processPayment 종료 (최종 상태 반환 완료)\n`);
  return status;
};
// exports.processPayment = async ({ email, planId, nickname }) => {
//   // 1. 유저 확인
//   const user = await this.getUserByEmail(email);
//   if (!user) throw new Error("USER_NOT_FOUND");
//
//   if (user.nickname !== nickname) {
//     console.warn(`[Warning] 결제 요청 닉네임 불일치: 요청(${nickname}) / DB(${user.nickname})`);
//   }
//
//   // 2. 플랜 정책 가져오기
//   const plan = PLAN_POLICIES[planId];
//   if (!plan) throw new Error("INVALID_PLAN");
//
//   // 3. 플랜 타입에 따라 처리
//   if (plan.type === "TICKET") {
//     // [단건 매칭권] 기존 개수에 더하기 (기존 로직 유지)
//     await this.addMatchCount(email, plan.matchCount);
//     await this.addAiMatchCount(email, plan.aiMatchCount);
//
//   } else if (plan.type === "PRO") {
//     // [PRO 구독 처리]
//     const expiredAt = new Date();
//     expiredAt.setMonth(expiredAt.getMonth() + (plan.months || 1));
//
//     // 유저 테이블 업데이트: is_pro, match_count, ai_match_count 명시적 변경
//     // Sequelize 모델 기준 (카멜케이스/스네이크케이스 여부는 모델 정의에 따름)
//     await user.update({
//       is_pro: true,              // PRO 상태 활성화
//       pro_expired_at: expiredAt, // 만료일 설정
//       match_count: plan.matchCount,    // 3으로 변경
//       ai_match_count: plan.aiMatchCount // 3으로 변경
//     });
//
//     console.log(`[Success] ${email} 유저 PRO 업그레이드 완료`);
//   }
//
//   // 4. 최종 업데이트된 유저 상태 반환
//   await user.reload();
//   return this.getUserStatus(email);
// };