// 메모리 기반 대기열
let waitingQueue = [];

/**
 * 대기열에 유저 추가
 */
exports.addToQueue = (socketId, email) => {
  this.removeFromQueueByEmail(email); // 중복 방지
  waitingQueue.push({ id: socketId, email });
  console.log(`[Queue] 추가됨: ${email} (현재 대기: ${waitingQueue.length}명)`);
};

/**
 * socketId로 대기열에서 제거
 */
exports.removeFromQueue = (socketId) => {
  waitingQueue = waitingQueue.filter((user) => user.id !== socketId);
};

/**
 * email로 대기열에서 제거
 */
exports.removeFromQueueByEmail = (email) => {
  waitingQueue = waitingQueue.filter((user) => user.email !== email);
};

/**
 * 매칭 시도 로직 (FIFO 방식)
 */
exports.tryMatch = () => {
  if (waitingQueue.length >= 2) {
    const user1 = waitingQueue.shift();
    const user2 = waitingQueue.shift();

    // 유니크한 방 ID 생성
    const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return { user1, user2, roomId };
  }
  return null;
};
