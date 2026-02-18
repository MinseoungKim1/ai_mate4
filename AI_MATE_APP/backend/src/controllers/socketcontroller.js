const matchService = require("../services/matchService");
const { users } = require("../services/userService");

module.exports = (io, socket) => {
  // 1. 매칭 대기열 진입
  socket.on("join-room", ({ email }) => {
    matchService.addToQueue(socket.id, email);
    console.log(`[Queue] 진입: ${email}`);

    const matchResult = matchService.tryMatch();

    if (matchResult) {
      const { user1, user2, roomId } = matchResult;
      const s1 = io.sockets.sockets.get(user1.id);
      const s2 = io.sockets.sockets.get(user2.id);

      if (s1 && s2) {
        const user1Info = users.find((u) => u.email === user1.email);
        const user2Info = users.find((u) => u.email === user2.email);

        s1.join(roomId);
        s2.join(roomId);

        io.to(user1.id).emit("match-success", {
          roomId,
          partnerNickname: user2Info ? user2Info.nickname : "익명",
        });
        io.to(user2.id).emit("match-success", {
          roomId,
          partnerNickname: user1Info ? user1Info.nickname : "익명",
        });
      }
    }
  });

  // 2. 메시지 중계
  socket.on("send-message", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-message", { text, sender: "other" });
  });

  // 💡 3. 명시적으로 방을 나갈 때 (뒤로가기 등)
  socket.on("leave-room", ({ roomId }) => {
    if (roomId) {
      socket.to(roomId).emit("partner-left"); // 상대방에게 알림
      socket.leave(roomId);
      console.log(`[Leave] 유저가 방을 나감: ${roomId}`);
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
    matchService.removeFromQueue(socket.id);
    console.log(`[Disconnect] 소켓 종료: ${socket.id}`);
  });
};
