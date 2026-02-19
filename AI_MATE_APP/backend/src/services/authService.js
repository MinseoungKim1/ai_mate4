// const { users } = require("./userService"); // 유저 목록은 userService에서 공유
const { User } = require("../models");

exports.registerUser = async (userData) => {
  const { email, password, nickname, gender, age } = userData;

  // const isExist = users.find((u) => u.email === email);
  // sgryu DB에서 이메일 중복 체크
  const isExist = await User.findOne({ where: { email } });
  if (isExist) throw new Error("ALREADY_EXISTS");

  // const newUser = {
  //   id: Date.now(),
  //   email,
  //   password,
  //   nickname,
  //   matchCount: 1,
  //   aiMatchCount: 1,
  //   isPro: false, // 💡 유료 사용 여부 추가 (기본값: false)
  // };
  // users.push(newUser);

  // DB에서 새 유저 생성
  const newUser = await User.create({
    email,
    password,
    nickname,
    gender,
    age,
    matchCount: 1,
    aiMatchCount: 1,
    isPro: false
  });

  return newUser;
};

// 일반 로그인
exports.loginUser = async (email, password) => {
  // const user = users.find((u) => u.email === email && u.password === password);
  // DB에서 유저 찾기
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("INVALID_CREDENTIALS");

  // 비밀번호 검증 (bcrypt)
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) throw new Error("INVALID_CREDENTIALS");

  // 마지막 로그인 시간 업데이트
  await user.update({ lastLoginAt: new Date() });

  return user;
};

// 카카오 로그인
exports.processKakaoLogin = async (code) => {
  const REST_API_KEY = "d1136ff6bbe22d5550a2338dbdc3e9e4";
  const REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";

  try {
    // 1. 인가 코드로 액세스 토큰 요청
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("카카오 토큰 요청 실패 상세:", tokenData);
      throw new Error(
          `카카오 토큰 에러: ${tokenData.error_description || tokenData.error}`,
      );
    }

    const accessToken = tokenData.access_token;

    // 2. 액세스 토큰으로 사용자 정보 요청
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error("카카오 사용자 정보 요청 실패");
    }

    // 💡 닉네임 및 카카오 고유 ID 추출 (이메일은 권한이 없으므로 추출하지 않음)
    const kakaoId = userData.id;
    const nickname = userData.properties?.nickname;

    // 3. 기존 가입 여부 확인
    // 💡 이메일 권한이 없으므로, 우리 DB에 저장된 'kakaoId'가 있는지 확인해야 합니다.
    // const user = users.find((u) => u.kakaoId === kakaoId);
    // DB에서 카카오 ID로 유저 찾기
    let user = await User.findOne({ where: { kakaoId } });

    if (user) {
      // 이미 가입된 유저: 로그인 성공 처리
      await user.update({ lastLoginAt: new Date() });

      return {
        success: true,
        isNewUser: false,
        token: `jwt-token-${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          matchCount: user.matchCount,
          aiMatchCount: user.aiMatchCount,
          isPro: user.isPro,
        },
      };
    } else {
      // 신규 유저: 카카오 ID와 닉네임만 들고 프론트엔드로 복귀
      // 💡 여기서 반환된 정보가 프론트엔드의 tempUser에 담깁니다.
      return {
        success: true,
        isNewUser: true,
        user: {
          kakaoId: kakaoId, // 나중에 회원가입 완료 시 DB에 함께 저장할 식별자
          nickname: nickname,
          // email은 여기서 주지 않습니다. 프론트엔드에서 직접 입력받을 것이기 때문입니다.
        },
      };
    }
  } catch (error) {
    console.error("authService Error:", error.message);
    throw error;
  }
};
