// 초기 데이터 인서트
const { User, AiProfile, ChatRoom, Message, ChatAnalysis } = require('../models');

(async () => {
    try {
        console.log('🌱 시드 데이터 삽입 시작...');

        // 1. Users
        const users = await User.bulkCreate([
            {
                id: 1,
                email: 'test@test.com',
                password: '1234',
                nickname: '신석우',
                gender: 'male',
                age: 25,
                matchCount: 1000,
                aiMatchCount: 1000,
                kakaoId: 4754308892,
                isPro: false,
            },
            {
                id: 2,
                email: 'alstjd9508@gmail.com',
                password: '1234',
                nickname: '김민성',
                gender: 'male',
                age: 25,
                matchCount: 1,
                aiMatchCount: 1,
                kakaoId: 4754006237,
                isPro: false,
            },
            {
                id: 3,
                email: 'user@user.com',
                password: '1234',
                nickname: '아무개',
                gender: 'male',
                age: 25,
                matchCount: 1,
                aiMatchCount: 1,
                isPro: false,
            },
        ]);
        console.log('✅ Users 삽입 완료');

        // 2. AI Profiles
        const aiProfiles = await AiProfile.bulkCreate([
            {
                name: '지아',
                gender: 'female',
                age: 26,
                personalityTags: ['지적인', '차분한', '예술적인'],
                personaDescription: '미술관과 전시회를 좋아하는 차분하고 지적인 성격',
                speakingStyle: 'formal',
                hobbies: ['미술관', '독서', '클래식음악'],
            },
            {
                name: '미나',
                gender: 'female',
                age: 24,
                personalityTags: ['활발한', '유머러스한'],
                personaDescription: '밝고 활발한 성격으로 유머 감각이 뛰어남',
                speakingStyle: 'casual',
                hobbies: ['여행', '카페투어', '운동'],
            },
        ]);
        console.log('✅ AI Profiles 삽입 완료');

        // 3. Chat Rooms
        await ChatRoom.bulkCreate([
            {
                id: 'chat_001',
                userId: 1,
                chatType: 'ai',
                aiProfileId: 1,
                partnerName: '지아',
                status: 'completed',
                messageCount: 10,
                isAnalyzed: true,
                analysisScore: 88,
                createdAt: '2026-02-14 14:00:00',
            },
            {
                id: 'chat_002',
                userId: 1,
                chatType: 'ai',
                aiProfileId: 2,
                partnerName: '미나',
                status: 'completed',
                messageCount: 4,
                isAnalyzed: true,
                analysisScore: 72,
                createdAt: '2026-02-10 15:30:00',
            },
        ]);
        console.log('✅ Chat Rooms 삽입 완료');

        // 4. Messages
        await Message.bulkCreate([
            {
                chatRoomId: 'chat_001',
                senderType: 'user',
                senderId: 1,
                messageText: '안녕하세요 지아님! 반갑습니다. 메이트한테 얘기 많이 들었어요.',
                createdAt: '2026-02-14 14:01:00',
            },
            {
                chatRoomId: 'chat_001',
                senderType: 'ai',
                messageText: '아, 안녕하세요! 저도요. 주말 오후에 이렇게 뵙게 되니 반갑네요.',
                createdAt: '2026-02-14 14:02:00',
            },
            {
                chatRoomId: 'chat_001',
                senderType: 'user',
                senderId: 1,
                messageText: '지적인 분위기가 매력적이시라고 들었는데, 정말 그런 것 같아요.',
                createdAt: '2026-02-14 14:03:00',
            },
            {
                chatRoomId: 'chat_001',
                senderType: 'ai',
                messageText: '어머, 과찬이세요. 저는 그냥 조용히 책 읽거나 전시회 보는 걸 좋아할 뿐이에요.',
                createdAt: '2026-02-14 14:04:00',
            },
        ]);
        console.log('✅ Messages 삽입 완료');

        // 5. Chat Analysis
        await ChatAnalysis.bulkCreate([
            {
                chatRoomId: 'chat_001',
                userId: 1,
                totalScore: 88,
                humorScore: 85,
                mannerScore: 92,
                empathyScore: 90,
                activenessScore: 88,
                conversationRhythmScore: 85,
                personalityTags: ['지적인', '차분한', '예술적인'],
                strengths: '상대방의 관심사에 공감하며 자연스럽게 대화를 이어갔습니다.',
                improvements: '좀 더 유머를 섞으면 대화가 더 풍성해질 수 있습니다.',
            },
            {
                chatRoomId: 'chat_002',
                userId: 1,
                totalScore: 72,
                humorScore: 70,
                mannerScore: 75,
                empathyScore: 68,
                activenessScore: 70,
                conversationRhythmScore: 75,
                personalityTags: ['활발한', '유머러스한'],
                strengths: '밝은 분위기로 대화를 시작했습니다.',
                improvements: '질문을 더 많이 하여 상대방에 대해 알아가는 시간을 가져보세요.',
            },
        ]);
        console.log('✅ Chat Analysis 삽입 완료');

        console.log('🎉 모든 시드 데이터 삽입 완료!');
        process.exit(0);
    } catch (error) {
        console.error('❌ 시드 데이터 삽입 실패:', error);
        process.exit(1);
    }
})();
