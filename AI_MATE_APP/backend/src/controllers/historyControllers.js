const historyService = require("../services/historyService");

// 히스토리 리스트 조회
exports.getHistories = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await historyService.getUserHistories(email);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "기록을 불러오지 못했습니다." });
  }
};

// 💡 대화 상세 내역 조회 추가
exports.getChatDetail = async (req, res) => {
  try {
    const { id } = req.params; // URL의 :id 값
    const messages = await historyService.getChatDetail(id);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "대화 상세 내역 로드 실패" });
  }
};

// 기록 삭제
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await historyService.deleteHistory(id);
    res.status(200).json({ success: true, message: "삭제 완료" });
  } catch (error) {
    res.status(500).json({ success: false, message: "삭제 실패" });
  }
};
// 🤖 AI 대화 분석 추가
exports.analyzeHistory = async (req, res) => {
  try {
    const { roomId } = req.body;
    const aiService = require("../services/aiService");
    const historyService = require("../services/historyService");

    // 1. 대화 내역 가져오기
    const messages = await historyService.getChatDetail(roomId);

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, message: "분석할 대화 내역이 없습니다." });
    }

    // 2. OpenAI 형식으로 변환
    const openAiMessages = messages.map(msg => ({
      role: msg.sender === "me" ? "user" : "assistant",
      content: msg.message_text
    }));

    // 3. AI 분석 요청
    const analysisResult = await aiService.getAiResponse(openAiMessages, "analyze");

    res.status(200).json({ success: true, data: analysisResult });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ success: false, message: "AI 분석 중 오류가 발생했습니다." });
  }
};
