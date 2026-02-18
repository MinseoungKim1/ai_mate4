const sequelize = require('../config/database');
const User = require('./User');
const AiProfile = require('./AiProfile');
const ChatRoom = require('./ChatRoom');
const Message = require('./Message');
const ChatAnalysis = require('./ChatAnalysis');

// ========== 관계 설정 ==========

// User ↔ ChatRoom
User.hasMany(ChatRoom, { foreignKey: 'userId', as: 'chatRooms' });
ChatRoom.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ ChatRoom (partner)
User.hasMany(ChatRoom, { foreignKey: 'partnerId', as: 'partnerChatRooms' });
ChatRoom.belongsTo(User, { foreignKey: 'partnerId', as: 'partner' });

// AiProfile ↔ ChatRoom
AiProfile.hasMany(ChatRoom, { foreignKey: 'aiProfileId', as: 'chatRooms' });
ChatRoom.belongsTo(AiProfile, { foreignKey: 'aiProfileId', as: 'aiProfile' });

// ChatRoom ↔ Message
ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId', as: 'messages' });
Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });

// User ↔ Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// ChatRoom ↔ ChatAnalysis (1:1)
ChatRoom.hasOne(ChatAnalysis, { foreignKey: 'chatRoomId', as: 'analysis' });
ChatAnalysis.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });

// User ↔ ChatAnalysis
User.hasMany(ChatAnalysis, { foreignKey: 'userId', as: 'analyses' });
ChatAnalysis.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ========== 동기화 함수 ==========
const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ 모든 모델이 동기화되었습니다.');
    } catch (error) {
        console.error('❌ 모델 동기화 실패:', error);
    }
};

module.exports = {
    sequelize,
    User,
    AiProfile,
    ChatRoom,
    Message,
    ChatAnalysis,
    syncDatabase,
};
