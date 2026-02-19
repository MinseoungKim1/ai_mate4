const { User, ChatRoom, Message, ChatAnalysis, AiProfile } = require('../models');

// ==================== 대화 목록 조회 ====================
exports.getUserHistories = async (email) => {
  try {
    // 1. 유저 찾기
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // 2. 해당 유저의 채팅방 목록 조회
    const chatRooms = await ChatRoom.findAll({
      where: { userId: user.id },
      include: [
        {
          model: AiProfile,
          as: 'aiProfile',
          attributes: ['name', 'personalityTags']
        },
        {
          model: ChatAnalysis,
          as: 'analysis',
          required: false // 분석 안 된 방도 포함
        }
      ],
      order: [['createdAt', 'DESC']], // 최근순
      limit: 50 // 최근 50개만 (성능 최적화)
    });

    // 3. 기존 프론트엔드 형식에 맞게 변환
    return chatRooms.map(room => ({
      id: room.id, // "chat_001"
      userEmail: email,
      partner: room.partnerName,
      date: new Date(room.createdAt).toISOString().split('T')[0].replace(/-/g, '.'), // "2026.02.14"
      score: room.analysisScore || 0,
      tags: room.analysis?.personalityTags || room.aiProfile?.personalityTags || [],
      chatType: room.chatType, // "ai" or "user"
      status: room.status || 'active',
      messageCount: room.messageCount || 0,
      appointmentMade: room.appointmentMade || false,
      createdAt: room.createdAt,
    }));

  } catch (error) {
    console.error("getUserHistories Error:", error);
    throw error;
  }
};

// ==================== 대화 상세 내역 조회 ====================
exports.getChatDetail = async (chatId) => {
  try {
    // 1. 채팅방 존재 확인
    const chatRoom = await ChatRoom.findByPk(chatId);
    if (!chatRoom) {
      throw new Error("CHAT_NOT_FOUND");
    }

    // 2. 해당 채팅방 메시지 목록 조회
    const messages = await Message.findAll({
      where: { chatRoomId: chatId },
      order: [['createdAt', 'ASC']], // 시간순
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['nickname']
        }
      ]
    });

    console.log(messages);

    // todo: 내가 보낸 메시지(me)와 상대가 보낸 메시지(other) 구분 필요
    //  현재는 senderType으로 되어 있는데 senderId (email)로 찾아오거나 다른 값을 써줘야 할듯
    return messages.map(msg => ({
      id: msg.id,
      chatId: msg.chatRoomId,
      sender: msg.senderType === 'user' ? 'me' : 'other',
      text: msg.messageText,
      aiCoaching: msg.aiCoaching || null,
      timestamp: msg.createdAt,
    }));

  } catch (error) {
    console.error("getChatDetail Error:", error);
    throw error;
  }
};

// ==================== 기록 삭제 ====================
exports.deleteHistory = async (chatId) => {
  try {
    // 1. 채팅방 존재 확인
    const chatRoom = await ChatRoom.findByPk(chatId);
    if (!chatRoom) {
      throw new Error("CHAT_NOT_FOUND");
    }

    // 2. 채팅방과 관련 데이터 삭제
    // ✅ 외래키 CASCADE 설정으로 Message, ChatAnalysis도 자동 삭제됨
    await chatRoom.destroy();

    return true;

  } catch (error) {
    console.error("deleteHistory Error:", error);
    throw error;
  }
};

// ==================== 추가 기능 ====================

// 채팅방 분석 결과 조회
exports.getChatAnalysis = async (chatId) => {
  try {
    const chatRoom = await ChatRoom.findByPk(chatId);
    if (!chatRoom) {
      throw new Error("CHAT_NOT_FOUND");
    }

    const analysis = await ChatAnalysis.findOne({
      where: { chatRoomId: chatId },
      include: [
        {
          model: ChatRoom,
          as: 'chatRoom',
          attributes: ['partnerName', 'chatType']
        }
      ]
    });

    return {
      chatRoom: chatRoom.toJSON(),
      analysis: analysis ? analysis.toJSON() : null,
      isAnalyzed: !!analysis,
    };

  } catch (error) {
    console.error("getChatAnalysis Error:", error);
    throw error;
  }
};

// 분석 결과 저장
exports.saveChatAnalysis = async (chatId, analysisData) => {
  try {
    const chatRoom = await ChatRoom.findByPk(chatId);
    if (!chatRoom) {
      throw new Error("CHAT_NOT_FOUND");
    }

    // 분석 결과 저장
    const analysis = await ChatAnalysis.create({
      chatRoomId: chatId,
      userId: chatRoom.userId,
      totalScore: analysisData.totalScore,
      humorScore: analysisData.humorScore,
      mannerScore: analysisData.mannerScore,
      empathyScore: analysisData.empathyScore,
      activenessScore: analysisData.activenessScore,
      conversationRhythmScore: analysisData.conversationRhythmScore,
      personalityTags: analysisData.personalityTags,
      strengths: analysisData.strengths,
      improvements: analysisData.improvements,
      detailedFeedback: analysisData.detailedFeedback,
    });

    // 채팅방 상태 업데이트
    await chatRoom.update({
      status: 'completed',
      isAnalyzed: true,
      analysisScore: analysis.totalScore,
    });

    return analysis;

  } catch (error) {
    console.error("saveChatAnalysis Error:", error);
    throw error;
  }
};

// 일정 잡기 완료 처리
exports.completeAppointment = async (chatId, appointmentDate) => {
  try {
    const chatRoom = await ChatRoom.findByPk(chatId);
    if (!chatRoom) {
      throw new Error("CHAT_NOT_FOUND");
    }

    await chatRoom.update({
      appointmentMade: true,
      appointmentDate: new Date(appointmentDate),
      status: 'completed',
    });

    return chatRoom;

  } catch (error) {
    console.error("completeAppointment Error:", error);
    throw error;
  }
};

// 채팅방 생성 (실시간 매칭 시작)
exports.createChatRoomIfNotExists = async (chatId, userInfo) => {
  const existingRoom = await ChatRoom.findOne({ where: { id: chatId } });

  if (!existingRoom) {
    await ChatRoom.create({
      id: chatId,
      userId: userInfo.user1Id || null,
      partnerId: userInfo.user2Id || null,
      chatType: 'user',
      partnerName: `${userInfo.user1Nickname} & ${userInfo.user2Nickname}`,
      user1Email: userInfo.user1Email,
      user2Email: userInfo.user2Email,
      status: 'active'
    });
    console.log(`[NEW] ChatRoom 생성: ${chatId}`);
  }
};

// 채팅방 생성 (AI 매칭 시작)
exports.createAiChatRoom = async (email, aiProfileId) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const aiProfile = await AiProfile.findByPk(aiProfileId);
    if (!aiProfile) {
      throw new Error("AI_PROFILE_NOT_FOUND");
    }

    // AI 매칭권 차감
    await userService.useAiMatchCount(email);

    // 새 채팅방 생성
    return await ChatRoom.create({
      id: `chat_${Date.now()}`,
      userId: user.id,
      chatType: 'ai',
      aiProfileId: aiProfile.id,
      partnerName: aiProfile.name,
      status: 'active',
      messageCount: 0,
    });

  } catch (error) {
    console.error("createChatRoom Error:", error);
    throw error;
  }
};

const ntfyService = require('./ntfyService');

// 실시간 메시지 저장 (Socket.io용)
exports.saveMessage = async (chatRoomId, senderType, senderId, messageText, aiCoaching = null) => {
  try {
    const chatRoom = await ChatRoom.findByPk(chatRoomId);
    if (!chatRoom) {
      throw new Error("CHAT_ROOM_NOT_FOUND");
    }

    // 메시지 저장 (senderId는 이제 BIGINT임)
    const message = await Message.create({
      chatRoomId,
      senderType,
      senderId, 
      messageText,
      aiCoaching,
    });

    // 채팅방 메시지 카운트 증가
    await chatRoom.increment('messageCount');
    await chatRoom.update({ lastMessageAt: new Date() });

    // ✅ ntfy.sh 알림 전송 (상대방에게 보냄)
    // senderId가 현재 사용자의 ID이므로, 상대방의 ID를 찾아야 함
    const partnerId = chatRoom.userId === senderId ? chatRoom.partnerId : chatRoom.userId;

    if (partnerId) {
      try {
          const partner = await User.findOne({
              where: { id: partnerId },
              include: [{
                  model: ChatAnalysis,
                  as: 'analyses',
                  limit: 1,
                  order: [['analyzedAt', 'DESC']]
              }]
          });

          const sender = await User.findByPk(senderId);

          if (partner && sender) {
              const latestScore = partner.analyses && partner.analyses.length > 0 
                  ? partner.analyses[0].totalScore 
                  : 50;
              
              const topic = ntfyService.generateUserTopic(partner, latestScore);
              await ntfyService.publish(topic, messageText, {
                  title: `${sender.nickname}님의 새 메시지`,
                  tags: 'incoming_envelope'
              });
              console.log(`[ntfy] Published to partner's topic: ${topic}`);
          }
      } catch (ntfyError) {
          console.error('[ntfy] Notification failed:', ntfyError.message);
      }
    }

    return message;

  } catch (error) {
    console.error("saveMessage Error:", error);
    throw error;
  }
};
