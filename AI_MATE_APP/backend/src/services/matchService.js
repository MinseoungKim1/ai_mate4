const { Match, User, ChatRoom } = require('../models');
const userService = require('./userService');

// ==================== 매칭 대기열 관리 ====================

/**
 * 대기열에 유저 추가
 */
exports.addToQueue = async (email) => {
  try {
    const user = await userService.getUserByEmail(email);
    console.log(`[DEBUG] User found: ${user ? user.email : 'NOT FOUND'}`);

    if (!user) {
      throw new Error(`USER_NOT_FOUND: ${email}`);
    }

    // ✅ 기존 pending 매칭 취소 (중복 방지)
    const existingPending = await Match.findOne({
      where: {
        user1Id: user.id,
        status: 'pending'
      }
    });

    if (existingPending) {
      await existingPending.destroy();
    }

    // ✅ 새 매칭 요청 생성
    const matchRequest = await Match.create({
      user1Id: user.id,
      user2Id: null, // 아직 매칭 안 됨
      matchType: 'free', // 기본값
      status: 'pending',
    });

    console.log(`[Queue] 대기열 추가: ${email} (${user.id})`);

    return matchRequest;

  } catch (error) {
    console.error("addToQueue Error:", error);
    throw error;
  }
};

/**
 * 특정 유저의 대기열에서 제거
 */
exports.removeFromQueue = async (email) => {
  try {
    const user = await userService.getUserByEmail(email);

    // ✅ pending 상태 매칭 취소
    const pendingMatch = await Match.findOne({
      where: {
        user1Id: user.id,
        status: 'pending'
      }
    });

    if (pendingMatch) {
      await pendingMatch.destroy();
      console.log(`[Queue] 대기열 제거: ${email}`);
    }

    return true;

  } catch (error) {
    console.error("removeFromQueue Error:", error);
    throw error;
  }
};

/**
 * 매칭 시도 (pending 상태 유저 2명 매칭)
 */
exports.tryMatch = async () => {
  try {
    // ✅ pending 상태인 유저 2명 찾기 (user2Id가 null인 경우)
    const pendingUsers = await Match.findAll({
      where: {
        status: 'pending',
        user2Id: null // 아직 매칭 안 된 유저들만
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['email', 'nickname', 'gender', 'age', 'id'],
          required: true
        }
      ],
      limit: 2,
      order: [['matched_at', 'ASC']] // 오래 기다린 순서대로
    });

    if (pendingUsers.length < 2) {
      return null; // 매칭할 유저 부족
    }

    const user1Match = pendingUsers[0];
    const user2Match = pendingUsers[1];

    // ✅ 매칭 성공! user2Id 업데이트 + 상태 변경
    const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // user1 매칭 업데이트
    await Match.update(
        {
          roomId,
          user2Id: user2Match.user1Id,
          status: 'accepted',
          matchedAt: new Date(),
        },
        { where: { id: user1Match.id } }
    );

    // user2 매칭 업데이트
    await Match.update(
        {
          roomId,
          user2Id: user1Match.user1Id,
          status: 'accepted',
          matched_at: new Date(),
        },
        { where: { id: user2Match.id } }
    );

    console.log(`[Match] 매칭 성공! ${user1Match.user1.email} ↔ ${user2Match.user1.email} (${roomId})`);

    return {
      roomId,
      user1: user1Match.user1,
      user2: user2Match.user1
    };

  } catch (error) {
    console.error("tryMatch Error:", error);
    throw error;
  }
};

// ==================== 매칭 상태 관리 ====================

/**
 * 특정 유저의 매칭 상태 조회
 */
exports.getUserMatchStatus = async (email) => {
  try {
    const user = await userService.getUserByEmail(email);

    // ✅ 현재 매칭 상태 조회 (pending, accepted)
    const currentMatch = await Match.findOne({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ],
        status: ['pending', 'accepted']
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['email', 'nickname']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['email', 'nickname']
        }
      ]
    });

    return {
      isInQueue: !!currentMatch && currentMatch.status === 'pending',
      isMatched: !!currentMatch && currentMatch.status === 'accepted',
      currentMatch: currentMatch ? currentMatch.toJSON() : null,
    };

  } catch (error) {
    console.error("getUserMatchStatus Error:", error);
    throw error;
  }
};

/**
 * 매칭 응답 처리 (accepted/rejected)
 */
exports.respondToMatch = async (matchId, response) => {
  try {
    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new Error("MATCH_NOT_FOUND");
    }

    // ✅ 응답 처리
    await Match.update(
        {
          status: response === 'accept' ? 'accepted' : 'rejected',
          responded_at: new Date()
        },
        { where: { id: matchId } }
    );

    console.log(`[Match] 응답: ${matchId} → ${response}`);

    return match;

  } catch (error) {
    console.error("respondToMatch Error:", error);
    throw error;
  }
};

/**
 * 매칭 완료 처리 (채팅방 생성 후)
 */
exports.completeMatch = async (roomId) => {
  try {
    const matches = await Match.findAll({
      where: { roomId, status: 'accepted' }
    });

    if (matches.length === 2) {
      await Match.update(
          {
            status: 'completed',
            chatRoomId: roomId // 채팅방 ID 연결
          },
          { where: { roomId } }
      );

      console.log(`[Match] 매칭 완료: ${roomId}`);
      return true;
    }

    return false;

  } catch (error) {
    console.error("completeMatch Error:", error);
    throw error;
  }
};

/**
 * 매칭 취소
 */
exports.cancelMatch = async (roomId) => {
  try {
    await Match.update(
        {
          status: 'cancelled'
        },
        { where: { roomId } }
    );

    console.log(`[Match] 매칭 취소: ${roomId}`);
    return true;

  } catch (error) {
    console.error("cancelMatch Error:", error);
    throw error;
  }
};

// ==================== 매칭 통계 ====================

/**
 * 유저의 매칭 히스토리 조회
 */
exports.getUserMatchHistory = async (email, limit = 10) => {
  try {
    const user = await userService.getUserByEmail(email);

    const matchHistory = await Match.findAll({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['email', 'nickname']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['email', 'nickname']
        },
        {
          model: ChatRoom,
          as: 'chatRoom',
          attributes: ['partnerName']
        }
      ],
      order: [['matched_at', 'DESC']],
      limit: limit
    });

    return matchHistory.map(match => match.toJSON());

  } catch (error) {
    console.error("getUserMatchHistory Error:", error);
    throw error;
  }
};
