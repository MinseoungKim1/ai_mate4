// 1. 대화 리스트 (History 메인 목록용)
const histories = [
  {
    id: "chat_001",
    userEmail: "test@test.com",
    partner: "지아",
    date: "2026.02.14",
    score: 88,
    tags: ["지적인", "차분한", "예술적인"],
    chatType: "ai",
  },
  {
    id: "chat_002",
    userEmail: "test@test.com",
    partner: "미나",
    date: "2026.02.10",
    score: 72,
    tags: ["활발한", "유머러스한"],
    chatType: "user",
  },
];

// 2. 💡 상세 대화 메시지 (HistoryChatRoom 열람용)
const chatMessages = [
  // chat_001 (지아님과의 대화) 상세 데이터
  {
    id: 4,
    chatId: "chat_001",
    sender: "me",
    text: "안녕하세요 지아님! 반갑습니다. 메이트한테 얘기 많이 들었어요.",
  },
  {
    id: 5,
    chatId: "chat_001",
    sender: "other",
    text: "아, 안녕하세요! 저도요. 주말 오후에 이렇게 뵙게 되니 반갑네요.",
  },
  {
    id: 6,
    chatId: "chat_001",
    sender: "me",
    text: "지적인 분위기가 매력적이시라고 들었는데, 정말 그런 것 같아요.",
  },
  {
    id: 7,
    chatId: "chat_001",
    sender: "other",
    text: "어머, 과찬이세요. 저는 그냥 조용히 책 읽거나 전시회 보는 걸 좋아할 뿐이에요.",
  },
  {
    id: 8,
    chatId: "chat_001",
    sender: "me",
    text: "오, 저도 전시회 좋아해요! 최근에 다녀오신 곳 중에 추천해주실 만한 곳이 있나요?",
  },
  {
    id: 9,
    chatId: "chat_001",
    sender: "other",
    text: "음, 최근에 시립미술관에서 하는 현대미술전을 봤는데 구성이 참 차분하더라고요.",
  },
  {
    id: 10,
    chatId: "chat_001",
    sender: "me",
    text: "아! 저도 거기 가보려고 했었는데. 혼자 가시는 편인가요?",
  },
  {
    id: 11,
    chatId: "chat_001",
    sender: "other",
    text: "네, 가끔은 혼자서 조용히 작품에 집중하는 시간이 힐링이 되더라고요. 혹시 실례가 안 된다면 어떤 스타일의 예술을 좋아하세요?",
  },
  {
    id: 12,
    chatId: "chat_001",
    sender: "me",
    text: "저는 너무 추상적인 것보다 따뜻한 색감의 인상주의 화풍을 좋아하는 편이에요.",
  },
  {
    id: 13,
    chatId: "chat_001",
    sender: "other",
    text: "정말요? 저랑 취향이 비슷하시네요! 인상주의 작품들은 보고 있으면 마음이 참 편안해지죠.",
  },

  // chat_002 (미나님과의 대화) 상세 데이터
  { id: 6, chatId: "chat_002", sender: "me", text: "오늘 날씨가 참 좋네요!" },
  {
    id: 7,
    chatId: "chat_002",
    sender: "other",
    text: "맞아요! 산책하기 딱 좋은 날씨예요.",
  },
];

// 대화 목록 조회
exports.getUserHistories = async (email) => {
  return histories.filter((h) => h.userEmail === email);
};

// 💡 대화 상세 내역 조회 추가
exports.getChatDetail = async (chatId) => {
  return chatMessages.filter((msg) => msg.chatId === chatId);
};

// 기록 삭제
exports.deleteHistory = async (id) => {
  const index = histories.findIndex((h) => h.id === id);
  if (index !== -1) {
    histories.splice(index, 1);
    return true;
  }
  return false;
};
