const matchService = require("../services/matchService");
const userService = require("../services/userService");
const historyService = require("../services/historyService");
const aiService = require("../services/aiService");

module.exports = (io, socket) => {
  console.log('✅ Socket 연결됨:', socket.id);

  // ==================== 매칭 대기열 ====================
  socket.on("join-room", async ({ email }) => {
    try {
      const user = await userService.getUserByEmail(email);
      socket.userEmail = email;
      socket.userId = user.id;

      // ✅ DB에 매칭 대기열 추가
      const matchRequest = await matchService.addToQueue(email);

      socket.emit("queue-joined", {
        matchId: matchRequest.id,
        message: "매칭 대기열에 들어갔습니다."
      });

      console.log(`[Queue] 진입: ${email} (userId: ${user.id})`);

      // ✅ 주기적으로 매칭 시도 (5초마다)
      const matchInterval = setInterval(async () => {
        const matchResult = await matchService.tryMatch();

        if (matchResult) {
          const { roomId, user1, user2 } = matchResult;

          // ✅ 매칭 성공! 관련 소켓 찾기
          const user1Socket = Array.from(io.sockets.sockets.values())
              .find(s => s.userEmail === user1.email);
          const user2Socket = Array.from(io.sockets.sockets.values())
              .find(s => s.userEmail === user2.email);

          if (user1Socket && user2Socket) {
            const ntfyService = require('../services/ntfyService');
            
            const getScore = (u) => (u.analyses && u.analyses.length > 0 ? u.analyses[0].totalScore : 50);
            const user1Topic = ntfyService.generateUserTopic(user1, getScore(user1));
            const user2Topic = ntfyService.generateUserTopic(user2, getScore(user2));

            // ✅ 방 입장
            user1Socket.join(roomId);
            user2Socket.join(roomId);

            // ✅ 매칭 성공 알림
            user1Socket.emit("match-success", {
              roomId,
              partner: {
                email: user2.email,
                nickname: user2.nickname,
                ntfyTopic: user2Topic
              }
            });

            user2Socket.emit("match-success", {
              roomId,
              partner: {
                email: user1.email,
                nickname: user1.nickname,
                ntfyTopic: user1Topic
              }
            });

            try {
              await historyService.createChatRoomIfNotExists(roomId, {
                user1Id: user1.id,
                user1Email: user1.email,
                user2Id: user2.id,
                user2Email: user2.email,
                user1Nickname: user1.nickname,
                user2Nickname: user2.nickname
              });
              console.log(`[ChatRoom] 생성됨: ${roomId}`);
            } catch (error) {
              console.error('[ChatRoom 생성] 에러:', error);
            }

            clearInterval(matchInterval);
          }
        }
      }, 5000);

      socket.matchInterval = matchInterval;

    } catch (error) {
      console.error("[Socket] join-match-queue Error:", error);
      socket.emit("queue-error", {
        message: error.message
      });
    }
  });

  // 매칭 대기열 나가기
  socket.on("leave-match-queue", async ({ email }) => {
    try {
      await matchService.removeFromQueue(email);

      if (socket.matchInterval) {
        clearInterval(socket.matchInterval);
        socket.matchInterval = null;
      }

      socket.emit("queue-left", { message: "대기열에서 나갔습니다." });
    } catch (error) {
      console.error("[Socket] leave-match-queue Error:", error);
      socket.emit("queue-error", { message: error.message });
    }
  });

  // ==================== 채팅방 ====================

  // 1. 채팅방 입장 (매칭 성공 후)
  socket.on("join-chat-room", ({ roomId, email }) => {
    socket.userEmail = email; // 소켓에 유저 정보 저장
    socket.join(roomId);
    console.log(`[Chat] ${email} 입장: ${roomId}`);
  });

  // 매칭 성공 시 해당 match는 status: completed, chatRoomId: 현재 roomId 업데이트
  // try {
  //   await matchService.updateMatchStatus(user1.email, user2.email, roomId, 'completed');
  //   console.log(`[Match] 상태 업데이트 완료: ${roomId}`);
  // } catch (error) {
  //   console.error('[Match 상태 업데이트] 에러:', error);
  // }
  
  // 2. 메시지 전송 (실시간 채팅)
  socket.on("send-message", async ({ roomId, text, aiCoaching = null }) => {
    try {
      // ✅ DB에 메시지 저장 (ntfy 알림도 여기서 처리됨)
      const message = await historyService.saveMessage(
          roomId,
          'user',
          socket.userId,
          text,
          aiCoaching
      );

      // ✅ 방에 있는 모든 사용자에게 전송
      io.to(roomId).emit("receive-message", {
        id: message.id,
        chatId: roomId,
        senderEmail: socket.userEmail,
        sender: "other", // 수신자는 "me", 발신자는 "other"로 표시
        text: message.messageText,
        timestamp: message.createdAt,
        aiCoaching: message.aiCoaching,
      });

    } catch (error) {
      console.error("[Socket] send-message Error:", error);
      socket.emit("message-error", {
        message: "메시지 전송 실패"
      });
    }
  });

  // 🤖 3. AI 메시지 처리
  socket.on("send-ai-message", async ({ messages, context, roomId }) => {
    try {
      // 💡 messages 형식: [{role: 'user', content: '...'}, {role: 'assistant', content: '...'}, ...]
      // frontend에서 보낼 때 sender: 'me' -> role: 'user', sender: 'other' -> role: 'assistant' 로 변환해서 보내거나
      // 여기서 변환해줘야 함. 여기서는 frontend에서 OpenAI format으로 보내준다고 가정하거나 변환함.

      const openAiMessages = messages.map(msg => ({
        role: msg.sender === "me" ? "user" : "assistant",
        content: msg.text
      }));

      const aiResponse = await aiService.getAiResponse(openAiMessages, "chat", context);

      // todo: AI 응답을 DB에 저장
      // await historyService.saveMessage(roomId, 'ai', email, aiResponse, null);

      socket.emit("receive-ai-message", {
        text: aiResponse,
        sender: "other",
        id: Date.now()
      });
    } catch (error) {
      console.error("AI Chat Error:", error);
      socket.emit("error", { message: "AI 대화 중 오류가 발생했습니다." });
    }
  });

  // 💡 3. 명시적으로 방을 나갈 때 (뒤로가기 등)
  socket.on("leave-room", ({ roomId }) => {
    if (roomId) {
      socket.to(roomId).emit("partner-left"); // 상대방에게 알림
      socket.leave(roomId);
      console.log(`[Leave] 유저가 방을 나감: ${roomId}`);

      // todo: ChatRoom status completed로 변경
      // chatRoomService.updateStatus(roomId, 'completed').catch(console.error);
    }
  });

  // 4. 연결 종료 시 (창 닫기, 네트워크 단절 등)
  socket.on("disconnecting", () => {
    // 사용자가 속해있던 모든 방에 '상대방이 나감' 알림 전송
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.to(room).emit("partner-left");
      }
    });
  });

  socket.on("disconnect", () => {
    // 매칭 대기열에서 제거
    if (socket.userEmail) {
      matchService.removeFromQueue(socket.userEmail).catch(console.error);
    }

    console.log(`[Disconnect] 소켓 종료: ${socket.id}`);
  });
};
