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
