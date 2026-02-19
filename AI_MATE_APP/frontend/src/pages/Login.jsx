import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MessageModal from "../components/MessageModal";
import kakaoLogo from "../assets/kakao_logo.svg";
import googleLogo from "../assets/google_logo.svg";
import { API_URL } from "../config";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [isSocial, setIsSocial] = useState(false);  //소셜/일반 구분
  const isProcessing = useRef(false);

  // 입력 필드 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  const [modal, setModal] = useState({ open: false, message: "" });
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // 💡 [추가] 이미 로그인된 유저가 주소창에 / 입력 시 홈으로 튕겨내기
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("userEmail");
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

    // 💡 [수정] 일반 회원가입으로 전환하는 함수
  const handleGeneralSignup = () => {
    setIsNewUser(true);
    setIsSocial(false); // 일반 가입임을 명시
    setIsLogin(false);
    // 필드 초기화
    setEmail("");
    setPassword("");
    setNickname("");
    setGender("");
    setAge("");
  };



  // 💡 카카오 로그인/가입 공용 URL 생성 함수
  const getKakaoAuthUrl = () => {
    const REST_API_KEY = "d1136ff6bbe22d5550a2338dbdc3e9e4";
    const REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";
    return `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=select_account`;
  };

  



  // 💡 [추가] 이메일 중복 체크 로직
  const checkEmailDuplicate = async (emailValue) => {
    if (!emailValue || isLogin) return; // 로그인 모드일 때는 체크 안 함

    try {
      const response = await fetch(
        `${API_URL}/api/auth/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailValue }),
        },
      ).then((res) => res.json());

      if (!response.success) {
        setModal({ open: true, message: "이미 사용 중인 이메일입니다." });
        setEmail(""); // 중복 시 필드 초기화
      }
    } catch (err) {
      console.error("중복 체크 중 오류:", err);
    }
  };

  // 1. 일반 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await login(email, password);

    if (response.success) {
      localStorage.setItem("nickname", response.data.user.nickname);
      localStorage.setItem("userEmail", email); // 🔒 인증 키 저장
      navigate("/home");
    } else {
      setModal({ open: true, message: response.message });
      setPassword("");
    }
  };

  // 2. 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    isProcessing.current = false;
    window.location.href = getKakaoAuthUrl();
  };

  // 3. 카카오 인증 후 콜백 처리
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const code = params.get("code");

  //   if (code && !isProcessing.current) {
  //     isProcessing.current = true;
  //     window.history.replaceState({}, null, window.location.pathname);

  //     fetch(`${API_URL}/api/auth/kakao`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ code }),
  //     })
  //       .then((res) => {
  //         if (!res.ok)
  //           return res.json().then((err) => {
  //             throw new Error(err.message);
  //           });
  //         return res.json();
  //       })
  //       .then((data) => {
  //         if (data.isNewUser) {
  //           setIsNewUser(true);
  //           setTempUser(data.user);
  //           setNickname(data.user.nickname);
  //         } else {
  //           localStorage.setItem("token", data.token);
  //           localStorage.setItem("nickname", data.user.nickname);
  //           localStorage.setItem("userEmail", data.user.email); // 🔒 인증 키 저장
  //           navigate("/home");
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("로그인 에러:", err.message);
  //         isProcessing.current = false;
  //         setModal({
  //           open: true,
  //           message: `로그인 중 오류가 발생했습니다: ${err.message}`,
  //         });
  //       });
  //   }
  // }, [navigate]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !isProcessing.current) {
      isProcessing.current = true;
      window.history.replaceState({}, null, window.location.pathname);

      fetch(`${API_URL}/api/auth/kakao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.isNewUser) {
          // 💡 신규 유저: 추가 정보 입력 페이지로 이동
          setIsNewUser(true);
          setIsSocial(true); // 💡 소셜 가입 상태로 전환
          setTempUser(data.user);
          setNickname(data.user.nickname);
          setEmail(data.user.email || ""); // 카카오 이메일이 있다면 자동 세팅
        } else {
          // 💡 기존 유저: 즉시 로그인 처리
          localStorage.setItem("token", data.token);
          localStorage.setItem("nickname", data.user.nickname);
          localStorage.setItem("userEmail", data.user.email);
          navigate("/home");
        }
      })
      .catch((err) => {
        console.error("로그인 에러:", err.message);
        isProcessing.current = false;
        setModal({ open: true, message: "로그인 중 오류가 발생했습니다." });
      });
    }
  }, [navigate]);

  // 💡 [수정] 최종 가입 처리 (일반/소셜 통합)
  const handleFinalSignup = async () => {
    if (!email || !nickname || !gender || !age || (!isSocial && !password)) {
      setModal({ open: true, message: "모든 정보를 올바르게 입력해주세요." });
      return;
    }

    const endpoint = isSocial
      ? `${API_URL}/api/auth/signup-complete`
      : `${API_URL}/api/auth/register`; // 일반 가입 API 주소 확인 필요

    const finalData = {
      ...(isSocial ? tempUser : {}),
      email,
      password, // 일반 가입 시 필요
      nickname,
      gender,
      age: Number(age),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nickname", data.user.nickname);
        localStorage.setItem("userEmail", data.user.email);
        navigate("/home");
      } else {
        setModal({ open: true, message: data.message });
      }
    } catch (err) {
      console.error("가입 에러:", err);
    }
  };

  const handleAgeChange = (e) => {
    const val = e.target.value;
    if (val !== "" && Number(val) < 0) {
      setAge("0");
    } else {
      setAge(val);
    }
  };

  return (
    <div style={fullScreenContainerStyle}>
      <MessageModal
        isOpen={modal.open}
        message={modal.message}
        onClose={() => setModal({ open: false, message: "" })}
      />
      <div style={authCardStyle}>
        <header style={headerStyle}>
          <div style={logoCircleStyle}>❤️</div>
          <h1 style={titleStyle}>AI MATE</h1>
          <p style={subtitleStyle}>마음을 읽는 스마트한 연애 코칭</p>
        </header>

        {isNewUser ? (
  <div style={formStyle}>
    <h2 style={signupTitleStyle}>
      {isSocial ? "카카오 가입을 완료해주세요" : "정보를 입력하고 가입을 완료하세요"}
    </h2>

    <div style={inputGroupStyle}>
      <label style={labelStyle}>이메일</label>
      <input
        type="email"
        placeholder="연락 가능한 이메일을 입력하세요"
        style={inputStyle}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={(e) => checkEmailDuplicate(e.target.value)}
        required
      />
    </div>

    {/* 💡 [수정] 카카오/일반 공통으로 비밀번호 입력 필드 노출 */}
    <div style={inputGroupStyle}>
      <label style={labelStyle}>비밀번호 설정</label>
      <input
        type="password"
        placeholder="사용하실 비밀번호를 입력하세요"
        style={inputStyle}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    {/* 💡 [수정] 닉네임 필드: 일반 가입 시 자유 입력 가능하도록 설정 */}
    <div style={inputGroupStyle}>
      <label style={labelStyle}>
        닉네임 {isSocial ? "(카카오 제공)" : "(직접 입력)"}
      </label>
      <input
        type="text"
        placeholder="사용하실 닉네임을 입력하세요"
        style={{
          ...inputStyle,
          backgroundColor: isSocial ? "#f9f9f9" : "#fff",
          color: isSocial ? "#888" : "#000",
        }}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        readOnly={isSocial} // 소셜 가입 시 닉네임을 고정하고 싶다면 true, 수정 허용 시 false
      />
    </div>

    <div style={inputGroupStyle}>
      <label style={labelStyle}>성별</label>
      <div style={selectionGridStyle}>
        {["male", "female"].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            style={{
              ...selectionButtonStyle,
              backgroundColor: gender === g ? "#ff4d4d" : "#fff",
              color: gender === g ? "#fff" : "#888",
              border: gender === g ? "1px solid #ff4d4d" : "1px solid #eee",
            }}
          >
            {g === "male" ? "남성" : "여성"}
          </button>
        ))}
      </div>
    </div>

    <div style={inputGroupStyle}>
      <label style={labelStyle}>정확한 나이</label>
      <input
        type="number"
        placeholder="예: 25"
        style={inputStyle}
        value={age}
        min="0"
        onChange={handleAgeChange}
      />
    </div>

    {/* 💡 모든 가입은 handleFinalSignup에서 통합 처리 */}
    <button onClick={handleFinalSignup} style={buttonStyle}>
      가입 완료하고 시작하기
    </button>
  </div>
) : (
          <>
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>이메일</label>
                <input
                  type="email"
                  placeholder="example@aimate.com"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>비밀번호</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={inputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" style={buttonStyle}>
                로그인하기
              </button>
            </form>

            <div style={dividerContainerStyle}>
              <div style={dividerLineStyle}></div>
              <span style={dividerTextStyle}>OR</span>
              <div style={dividerLineStyle}></div>
            </div>

            <div style={socialButtonGroupStyle}>
              <button
                type="button"
                onClick={handleKakaoLogin}
                style={kakaoButtonStyle}
              >
                <img src={kakaoLogo} alt="Kakao" style={socialIconImageStyle} />
                카카오로 시작하기
              </button>
              {/* <button type="button" style={googleButtonStyle}>
                <img
                  src={googleLogo}
                  alt="Google"
                  style={socialIconImageStyle}
                />
                Google로 시작하기
              </button> */}
            </div>

            <p
              style={toggleTextStyle}
               onClick={handleGeneralSignup} // 💡 카카오가 아닌 일반 가입 폼으로 연결
            >
              아직 계정이 없으신가요?{" "}
              <span style={highlightStyle}>회원가입</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const fullScreenContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  minHeight: "100vh",
  padding: "40px 0",
  background: "linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)",
};
const authCardStyle = {
  padding: "40px 30px",
  width: "90%",
  maxWidth: "400px",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "32px",
  boxShadow: "0 20px 60px rgba(255, 100, 100, 0.08)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
};
const headerStyle = { textAlign: "center", marginBottom: "30px" };
const logoCircleStyle = {
  fontSize: "2.5rem",
  marginBottom: "10px",
  display: "inline-block",
};
const titleStyle = {
  color: "#ff4d4d",
  margin: 0,
  fontSize: "1.7rem",
  fontWeight: "900",
};
const subtitleStyle = {
  color: "#aaa",
  marginTop: "5px",
  fontSize: "0.9rem",
  fontWeight: "500",
};
const formStyle = { display: "flex", flexDirection: "column", gap: "16px" };
const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};
const labelStyle = {
  fontSize: "0.8rem",
  color: "#888",
  fontWeight: "700",
  marginLeft: "4px",
};
const inputStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid #eee",
  backgroundColor: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.2s ease",
};
const selectionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "8px",
};
const selectionButtonStyle = {
  padding: "12px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  transition: "all 0.2s ease",
  outline: "none",
  border: "1px solid #eee",
};
const buttonStyle = {
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  background: "#ff4d4d",
  color: "white",
  fontWeight: "800",
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 10px 20px rgba(255, 77, 77, 0.15)",
};
const dividerContainerStyle = {
  display: "flex",
  alignItems: "center",
  margin: "25px 0",
  gap: "10px",
};
const dividerLineStyle = { flex: 1, height: "1px", backgroundColor: "#f0f0f0" };
const dividerTextStyle = {
  color: "#ddd",
  fontSize: "0.75rem",
  fontWeight: "800",
};
const socialButtonGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "25px",
};
const kakaoButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px",
  borderRadius: "16px",
  border: "none",
  fontWeight: "700",
  fontSize: "0.9rem",
  cursor: "pointer",
  backgroundColor: "#FEE500",
  color: "#3c1e1e",
};
const googleButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid #eee",
  fontWeight: "700",
  fontSize: "0.9rem",
  cursor: "pointer",
  backgroundColor: "#fff",
  color: "#555",
};
const socialIconImageStyle = {
  width: "18px",
  height: "18px",
  marginRight: "10px",
};
const toggleTextStyle = {
  textAlign: "center",
  cursor: "pointer",
  color: "#aaa",
  fontSize: "0.85rem",
  marginTop: "10px",
};
const highlightStyle = {
  color: "#ff4d4d",
  fontWeight: "bold",
  textDecoration: "underline",
};
const signupTitleStyle = {
  fontSize: "1.1rem",
  textAlign: "center",
  marginBottom: "10px",
  color: "#555",
};

export default Login;
