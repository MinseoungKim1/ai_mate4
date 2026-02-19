const historyService = require("../services/historyService");
const aiService = require("../services/aiService");
const { User, ChatRoom, Message } = require('../models');

// 히스토리 리스트 조회
exports.getHistories = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await historyService.getUserHistories(email);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    res
        .status(500)
        .json({ success: false, message: "기록을 불러오지 못했습니다." });
  }
};

// 💡 대화 상세 내역 조회 추가
exports.getChatDetail = async (req, res) => {
  try {
    const { id } = req.params; // URL의 :id 값
    const data = await historyService.getChatDetail(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message === "CHAT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "대화를 찾을 수 없습니다." });
    }
    res
        .status(500)
        .json({ success: false, message: "내역을 불러오지 못했습니다." });
  }
};

// 기록 삭제
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await historyService.deleteHistory(id);
    res.status(200).json({ success: true, message: "삭제 완료" });
  } catch (error) {
    if (error.message === "CHAT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "대화를 찾을 수 없습니다." });
    }
    res.status(500).json({ success: false, message: "삭제 실패" });
  }
};

// 🛠️ 비정상적인 JSON 형식을 최대한 복구하여 파싱하는 헬퍼
const dirtyJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log("[dirtyJsonParse] Strict JSON parse failed, attempting recovery...");
    try {
      // 1. 개행 문자 처리: 문자열 내부의 실제 개행을 \n으로 변환하거나 공백으로 대체
      // (JSON은 문자열 내의 실제 줄바꿈을 허용하지 않음)
      let fixed = str.replace(/\n/g, ' '); 

      // 2. 키(Key)에 따옴표가 없는 경우 수정: { key: value } -> { "key": value }
      // 💡 {, [, ,, 공백 뒤에 오는 단어를 키로 간주
      fixed = fixed.replace(/([{,\[\s])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      // 3. 홑따옴표(')를 쌍따옴표(")로 변경
      // 💡 일단 전체 변경 시도 (문장 내 따옴표는 수동으로 주의해야 함)
      fixed = fixed.replace(/'/g, '"');

      // 4. 속성 뒤에 남는 쉼표 제거: { "a": 1, } -> { "a": 1 }
      fixed = fixed.replace(/,\s*([}\]])/g, '$1');
      
      return JSON.parse(fixed);
    } catch (innerError) {
      console.error("[dirtyJsonParse] Recovery failed:", innerError);
      throw e; // 원본 에러를 던짐
    }
  }
};

// 🤖 AI 대화 분석 추가
exports.analyzeHistory = async (req, res) => {
  try {
    const { roomId } = req.body;

    // 1. 기존 분석 결과가 있는지 먼저 확인 (캐싱)
    const existingAnalysis = await historyService.getChatAnalysis(roomId);
    if (existingAnalysis && existingAnalysis.isAnalyzed) {
      console.log(`[Analysis] 기존 결과 반환: ${roomId}`);
      return res.status(200).json({ success: true, data: existingAnalysis.analysis });
    }

    // 2. 메시지 내역 가져오기
    const chatDetail = await historyService.getChatDetail(roomId);
    if (!chatDetail || chatDetail.length === 0) {
      return res.status(400).json({ success: false, message: "분석할 대화 내용이 없습니다." });
    }

    // 3. AI 분석 요청용 프롬프트 구성
    const messagesForAi = chatDetail.map(msg => ({
      role: msg.sender === 'me' ? 'user' : 'assistant',
      content: msg.text
    }));

    // 4. AI 서비스 호출
    const aiResponse = await aiService.getAiResponse(messagesForAi, "analyze");
    
    // JSON 파싱 (AI 응답에서 JSON만 추출)
    let analysisResult;
    
    // ✅ aiService가 이미 객체를 반환한 경우 (json_object 모드 등)
    if (typeof aiResponse === 'object' && aiResponse !== null) {
      analysisResult = aiResponse;
    } else {
      // 문자열인 경우 기존 파싱 로직 수행
      try {
        const jsonStart = aiResponse.indexOf('{');
        const jsonEnd = aiResponse.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("JSON 형식을 찾을 수 없습니다.");
        }
        
        const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
        analysisResult = dirtyJsonParse(jsonStr);
      } catch (parseError) {
        console.error("AI Response Parsing Error:", aiResponse);
        throw new Error(`AI 응답 형식 오류: ${parseError.message}`);
      }
    }

    // 5. DB에 분석 결과 저장
    // AI 응답 형식을 DB 컬럼에 맞게 매핑
    const mappedData = {
        totalScore: analysisResult.totalScore,
        humorScore: analysisResult.stats?.find(s => s.label === "센스")?.value || 50,
        mannerScore: analysisResult.stats?.find(s => s.label === "호감도")?.value || 50,
        empathyScore: analysisResult.stats?.find(s => s.label === "공감능력")?.value || 50,
        activenessScore: analysisResult.stats?.find(s => s.label === "대화량")?.value || 50,
        conversationRhythmScore: 50, // 기본값
        personalityTags: [analysisResult.style || "열정적인 대화가"],
        strengths: analysisResult.desc || "분석 완료",
        improvements: analysisResult.advice || "계속해서 즐겁게 대화해 보세요.",
        detailedFeedback: analysisResult
    };

    const savedAnalysis = await historyService.saveChatAnalysis(roomId, mappedData);

    res.status(200).json({ success: true, data: savedAnalysis });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ success: false, message: error.message || "AI 분석 중 오류가 발생했습니다." });
  }
};

// 💾 AI 대화 중 분석 시작 전 대화 저장
exports.saveAiChat = async (req, res) => {
  try {
    const { email, messages, partnerName } = req.body;

    // 1. 유저 찾기
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    // 2. 채팅방 생성
    const roomId = `ai_chat_${Date.now()}`;
    await ChatRoom.create({
      id: roomId,
      userId: user.id,
      chatType: 'ai',
      partnerName: partnerName || "AI 지아",
      status: 'active',
      messageCount: messages.length,
      lastMessageAt: new Date(),
    });

    // 3. 메시지들 저장
    const messageRecords = messages.map(msg => ({
      chatRoomId: roomId,
      senderType: msg.sender === 'me' ? 'user' : 'ai',
      senderId: user.id, // AI인 경우도 일단 userId로 넣어두거나(historyService 참고) 관리 필요
      messageText: msg.text,
      createdAt: new Date(),
    }));

    await Message.bulkCreate(messageRecords);

    res.status(200).json({ success: true, roomId });
  } catch (error) {
    console.error("Save AI Chat Error:", error);
    res.status(500).json({ success: false, message: "대화 저장 중 오류가 발생했습니다." });
  }
};
