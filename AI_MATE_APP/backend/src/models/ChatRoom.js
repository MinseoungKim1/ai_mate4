const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id',
    },
    chatType: {
        type: DataTypes.ENUM('ai', 'user'),
        allowNull: false,
        field: 'chat_type',
    },
    partnerId: {
        type: DataTypes.BIGINT,
        field: 'partner_id',
    },
    aiProfileId: {
        type: DataTypes.BIGINT,
        field: 'ai_profile_id',
    },
    partnerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'partner_name',
    },
    status: {
        type: DataTypes.ENUM('active', 'analyzing', 'completed', 'archived'),
        defaultValue: 'active',
    },
    messageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'message_count',
    },
    appointmentMade: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'appointment_made',
    },
    appointmentDate: {
        type: DataTypes.DATE,
        field: 'appointment_date',
    },
    isAnalyzed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_analyzed',
    },
    analysisScore: {
        type: DataTypes.INTEGER,
        field: 'analysis_score',
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        field: 'last_message_at',
    },
}, {
    tableName: 'chat_rooms',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['chat_type'] },
        { fields: ['status'] },
        { fields: ['created_at'] },
    ],
});

module.exports = ChatRoom;
