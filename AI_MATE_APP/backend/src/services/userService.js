// 메모리 DB 공유
const users = [
  /**
   * 유저 데이터 구조 설명:
   * - id: 시스템 내부 고유 ID
   * - email: 일반 가입 시 입력한 이메일 또는 카카오 가입 시 직접 입력한 이메일
   * - password: 일반 가입 비밀번호 (소셜 로그인은 "social_login"으로 처리)
   * - nickname: 카카오에서 가져온 닉네임 또는 일반 가입 닉네임
   * - kakaoId: 카카오 API에서 제공하는 고유 식별 번호 (소셜 유저 전용)
   * - gender/age: 회원가입 시 추가로 입력받은 정보
   */
  {
    id: 1,
    email: "test@test.com",
    password: "1234",
    nickname: "신석우",
    gender: "male",
    age: 25,
    matchCount: 1000,
    aiMatchCount: 1000,
    kakaoId: 4754308892,
    isPro: false, // 기본값
  },
  {
    id: 2,
    email: "alstjd9508@gmail.com",
    password: "1234",
    nickname: "김민성",
    gender: "male",
    age: 25,
    matchCount: 10,
    aiMatchCount: 5,
    kakaoId: 4754006237, // 카카오에서 제공하는 고유 ID 숫자형식
    isPro: false, // 기본값
  },
  {
    id: 3,
    email: "user@user.com",
    password: "1234",
    nickname: "아무개",
    gender: "male",
    age: 25,
    matchCount: 1,
    aiMatchCount: 1,
    isPro: false, // 기본값
  },
];

exports.users = users;

// 1. 공통 유저 조회 함수
exports.getUserByEmail = async (email) => {
  const user = users.find((u) => u.email === email);
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

// 3. 일반 매칭권 차감 로직
exports.useMatchCount = async (email) => {
  const user = await this.getUserByEmail(email);
  if (user.matchCount <= 0) throw new Error("NO_MATCH_COUNT");

  user.matchCount -= 1;
  // 차감 후의 최신 상태를 반환
  return this.getUserStatus(email);
};

// 4. AI 매칭권 차감 로직
exports.useAiMatchCount = async (email) => {
  const user = await this.getUserByEmail(email);
  if (user.aiMatchCount <= 0) throw new Error("NO_AI_MATCH_COUNT");

  user.aiMatchCount -= 1;
  // 차감 후의 최신 상태를 반환
  return this.getUserStatus(email);
};
