import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react"; // 💡 아이콘 추가
import MessageModal from "../components/MessageModal";

const IdealSelect = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAge, setSelectedAge] = useState("");
  const [modal, setModal] = useState({ open: false, message: "" });

  const tags = ["귀여운", "지적인", "활발한", "차분한", "유머러스한", "섬세한"];
  const ages = [
    "20대 초반",
    "20대 중반",
    "20대 후반",
    "30대 초반",
    "30대 중반",
    "상관없음",
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      return;
    }
    if (selectedTags.length >= 3) {
      setModal({
        open: true,
        message: "스타일은 최대 3개까지 선택 가능합니다!",
      });
      return;
    }
    setSelectedTags([...selectedTags, tag]);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedTags.length > 0) setStep(2);
  };

  const handleStart = () => {
    if (selectedAge) {
      navigate("/ai-chat", { state: { tags: selectedTags, age: selectedAge } });
    }
  };

  return (
    <div style={outerWrapperStyle}>
      <div style={appContainerStyle}>
        <MessageModal
          isOpen={modal.open}
          message={modal.message}
          onClose={() => setModal({ open: false, message: "" })}
        />

        {/* 헤더 영역 - 💡 ChevronLeft 적용 */}
        <header style={headerStyle}>
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
            style={backBtnStyle}
          >
            <ChevronLeft size={28} color="#333" />
          </button>
          <div style={stepIndicatorStyle}>STEP {step}/2</div>
          <div style={{ width: "28px" }}></div>
        </header>

        <div style={contentStyle}>
          {step === 1 ? (
            <>
              <h2 style={titleStyle}>
                어떤 스타일의 이성을
                <br />
                만나고 싶으신가요?
              </h2>
              <p style={subTitleStyle}>최대 3개까지 선택 가능합니다.</p>

              <div style={tagContainerStyle}>
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <div
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={tagItemStyle(isSelected)}
                    >
                      {tag}
                      {isSelected && (
                        <Check size={14} style={{ marginLeft: "4px" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 style={titleStyle}>
                희망하는 상대방의
                <br />
                나이대는 어떻게 되나요?
              </h2>
              <p style={subTitleStyle}>하나만 선택해주세요.</p>

              <div style={ageContainerStyle}>
                {ages.map((age) => {
                  const isSelected = selectedAge === age;
                  return (
                    <div
                      key={age}
                      onClick={() => setSelectedAge(age)}
                      style={ageItemStyle(isSelected)}
                    >
                      <span>{age}</span>
                      {isSelected && (
                        <div style={checkCircleStyle}>
                          <Check size={16} color="#fff" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 하단 고정 버튼 */}
        <div style={bottomButtonAreaStyle}>
          {step === 1 ? (
            <button
              disabled={selectedTags.length === 0}
              onClick={handleNextStep}
              style={buttonStyle(selectedTags.length > 0)}
            >
              다음 단계로 (1/2)
            </button>
          ) : (
            <button
              disabled={!selectedAge}
              onClick={handleStart}
              style={buttonStyle(!!selectedAge)}
            >
              AI 메이트와 대화 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ✨ 스타일 정의 ---

const outerWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f0f2f5",
};

const appContainerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "95vh",
  backgroundColor: "#fff",
  borderRadius: "30px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #f8f9fa",
};

const stepIndicatorStyle = {
  fontSize: "0.85rem",
  fontWeight: "800",
  color: "#ff4d4d",
};

const contentStyle = { flex: 1, padding: "30px 25px", overflowY: "auto" };

const titleStyle = {
  fontSize: "1.5rem",
  fontWeight: "900",
  color: "#333",
  lineHeight: "1.4",
  marginBottom: "10px",
};

const subTitleStyle = {
  fontSize: "0.9rem",
  color: "#aaa",
  marginBottom: "30px",
};

const tagContainerStyle = { display: "flex", flexWrap: "wrap", gap: "12px" };

const tagItemStyle = (isSelected) => ({
  display: "flex",
  alignItems: "center",
  padding: "12px 22px",
  borderRadius: "25px",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s",
  border: `2px solid ${isSelected ? "#ff4d4d" : "#f0f0f0"}`,
  backgroundColor: isSelected ? "#fff5f5" : "#fff",
  color: isSelected ? "#ff4d4d" : "#666",
  fontWeight: isSelected ? "bold" : "500",
});

const ageContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const ageItemStyle = (isSelected) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 24px",
  borderRadius: "18px",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.2s",
  border: `2px solid ${isSelected ? "#ff4d4d" : "#f0f0f0"}`,
  backgroundColor: isSelected ? "#fffafb" : "#fff",
  color: isSelected ? "#ff4d4d" : "#444",
  fontWeight: isSelected ? "bold" : "500",
});

const checkCircleStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "#ff4d4d",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const bottomButtonAreaStyle = { padding: "20px 25px 40px" };

const buttonStyle = (isActive) => ({
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "none",
  background: isActive
    ? "linear-gradient(135deg, #ff6b6b 0%, #ff4d4d 100%)"
    : "#eee",
  color: isActive ? "white" : "#aaa",
  fontWeight: "800",
  fontSize: "1.1rem",
  cursor: isActive ? "pointer" : "not-allowed",
  boxShadow: isActive ? "0 10px 20px rgba(255, 77, 77, 0.2)" : "none",
  transition: "all 0.3s",
});

const backBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
};

export default IdealSelect;
