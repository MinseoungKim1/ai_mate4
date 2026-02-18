const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    chatRoomId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'chat_room_id',
    },
    senderType: {
        type: DataTypes.ENUM('user', 'ai', 'system'),
        allowNull: false,
        field: 'sender_type',
    },
    senderId: {
        type: DataTypes.STRING(255),
        field: 'sender_id',
    },
    messageText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'message_text',
    },
    aiCoaching: {
        type: DataTypes.JSON,
        field: 'ai_coaching',
        comment: 'JSON: suggestions, tip 등',
    },
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    updatedAt: false, // 메시지는 수정되지 않으므로
    indexes: [
        { fields: ['chat_room_id'] },
        { fields: ['created_at'] },
    ],
});

module.exports = Message;
