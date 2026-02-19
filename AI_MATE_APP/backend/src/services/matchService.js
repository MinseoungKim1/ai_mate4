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

const ntfyService = require('./ntfyService');
const { ChatAnalysis } = require('../models');

/**
 * 매칭 시도 (점수 기반 매칭)
 */
exports.tryMatch = async () => {
  try {
    // ✅ pending 상태인 모든 유저 가져오기
    const pendingMatches = await Match.findAll({
      where: {
        status: 'pending',
        user2Id: null
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'email', 'nickname', 'gender', 'age'],
          include: [{
              model: ChatAnalysis,
              as: 'analyses',
              limit: 1,
              order: [['analyzedAt', 'DESC']]
          }]
        }
      ],
      order: [['matched_at', 'ASC']]
    });

    if (pendingMatches.length < 2) {
      return null;
    }

    // ✅ 점수 정보를 포함하여 리스트 정리
    const candidates = pendingMatches.map(m => {
        const latestAnalysis = m.user1.analyses && m.user1.analyses.length > 0 ? m.user1.analyses[0] : null;
        return {
            match: m,
            user: m.user1,
            score: latestAnalysis ? latestAnalysis.totalScore : 50 // 점수 없으면 기본값 50
        };
    });

    // ✅ 매칭 알고리즘: 가장 오래 기다린 유저(candidates[0])와 가장 점수가 비슷한 다른 성별의 유저 찾기
    const user1 = candidates[0];
    let bestMatchIndex = -1;
    let minScoreDiff = Infinity;

    for (let i = 1; i < candidates.length; i++) {
        const user2 = candidates[i];
        
        // 성별이 다른 경우 우선 (비즈니스 로직에 따라 변경 가능)
        if (user1.user.gender !== user2.user.gender) {
            const diff = Math.abs(user1.score - user2.score);
            if (diff < minScoreDiff) {
                minScoreDiff = diff;
                bestMatchIndex = i;
            }
        }
    }

    // 만약 다른 성별이 없으면 그냥 가장 점수 비슷한 유저와 매칭
    if (bestMatchIndex === -1) {
        for (let i = 1; i < candidates.length; i++) {
            const user2 = candidates[i];
            const diff = Math.abs(user1.score - user2.score);
            if (diff < minScoreDiff) {
                minScoreDiff = diff;
                bestMatchIndex = i;
            }
        }
    }

    if (bestMatchIndex === -1) return null;

    const user2 = candidates[bestMatchIndex];
    const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // ✅ 트랜잭션 없이 각각 업데이트 (간단하게)
    await Match.update(
        { roomId, user2Id: user2.user.id, status: 'accepted', matchedAt: new Date() },
        { where: { id: user1.match.id } }
    );
    await Match.update(
        { roomId, user2Id: user1.user.id, status: 'accepted', matchedAt: new Date() },
        { where: { id: user2.match.id } }
    );

    console.log(`[Match] 점수 기반 매칭 성공: ${user1.user.email}(${user1.score}) ↔ ${user2.user.email}(${user2.score})`);

    // ✅ ntfy.sh 알림 전송
    const notifyMatch = async (me, partner, myScore) => {
        try {
            const topic = ntfyService.generateUserTopic(me, myScore);
            await ntfyService.publish(topic, `${partner.nickname}님과 매칭되었습니다! 채팅을 시작해보세요.`, {
                title: '🎉 매칭 성공!',
                tags: 'heart,party_popper'
            });
        } catch (e) {
            console.error('[ntfy] Match notification failed:', e.message);
        }
    };

    await notifyMatch(user1.user, user2.user, user1.score);
    await notifyMatch(user2.user, user1.user, user2.score);

    return {
      roomId,
      user1: user1.user,
      user2: user2.user
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
