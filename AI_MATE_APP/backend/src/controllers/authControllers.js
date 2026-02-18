const authService = require("../services/authService");
// const { users } = require('../services/userService');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      user: {
        email: newUser.email,
        nickname: newUser.nickname,
        matchCount: newUser.matchCount,
        aiMatchCount: newUser.aiMatchCount, // 💡 추가
        isPro: false, // 기본값
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 1. 로그인 통합 컨트롤러
exports.login = async (req, res) => {
  try {
    const { email, password, code } = req.body;

    // 카카오 로그인 처리
    if (code) {
      const result = await authService.processKakaoLogin(code);
      return res.status(200).json(result);
    }

    // 일반 로그인 처리 (기존 양식 유지)
    // 💡 위에서 가져온 'users' 배열을 사용하여 유저를 찾습니다. -> sgryu: User 테이블에서 찾도옥 변경
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: "인증 실패 (이메일 또는 비밀번호 불일치)" });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "인증 실패 (이메일 또는 비밀번호 불일치)" });
    }

    await user.update({ lastLogin: new Date() });

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        nickname: user.nickname,
        matchCount: user.matchCount,
        aiMatchCount: user.aiMatchCount,
        isPro: user.isPro,
      },
    });

    // if (user) {
    //   return res.status(200).json({
    //     success: true,
    //     user: {
    //       email: user.email,
    //       nickname: user.nickname,
    //       matchCount: user.matchCount,
    //       aiMatchCount: user.aiMatchCount,
    //     },
    //   });
    // } else {
    //   return res.status(401).json({ message: "인증 실패 (이메일 또는 비밀번호 불일치)" });
    // }

  } catch (error) {
    console.error("Login Controller Error:", error.message);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 2. 최종 회원가입 완료
exports.completeSignup = async (req, res) => {
  try {
    const { email, nickname, gender, age, kakaoId, password } = req.body;

    if (!email || !nickname || !gender || !age) {
      return res.status(400).json({ success: false, message: "모든 정보를 입력해주세요." });
    }

    // 💡 여기서도 'users' 배열을 사용하여 중복 체크를 합니다.
    // const existingUser = users.find(u => u.email === email); -> sgryu DB 조회 변경
    const existingUser = await User.findOne({ where: { email }});
    if (existingUser) {
      return res.status(400).json({ success: false, message: "이미 가입된 이메일입니다." });
    }

    // 실제 DB 삽입
    const newUser = await User.create({
      email,
      nickname,
      gender,
      age: Number(age),
      kakaoId: kakaoId || null,
      matchCount: 1,
      aiMatchCount: 1,
      password,
      isPro: false
    });

    // users.push(newUser);

    return res.status(201).json({
      success: true,
      token: `jwt-token-${newUser.id}`, // 나중에 JWT 토큰으로 교체
      user: {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        matchCount: newUser.matchCount,
        aiMatchCount: newUser.aiMatchCount
      }
    });

  } catch (error) {
    console.error("completeSignup Error:", error);
    return res.status(500).json({ success: false, message: "회원가입 처리 중 오류 발생" });
  }
};
// 기존 로그인 로직
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await authService.loginUser(email, password);
//     res.status(200).json({
//       success: true,
//       user: {
//         email: user.email,
//         nickname: user.nickname,
//         matchCount: user.matchCount,
//         aiMatchCount: user.aiMatchCount, // 💡 추가
//       },
//     });
//   } catch (error) {
//     res.status(401).json({ message: "인증 실패" });
//   }
// };
