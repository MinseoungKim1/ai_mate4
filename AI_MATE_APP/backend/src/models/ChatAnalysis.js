const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatAnalysis = sequelize.define('ChatAnalysis', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    chatRoomId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'chat_room_id',
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id',
    },
    totalScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'total_score',
    },
    humorScore: {
        type: DataTypes.INTEGER,
        field: 'humor_score',
    },
    mannerScore: {
        type: DataTypes.INTEGER,
        field: 'manner_score',
    },
    empathyScore: {
        type: DataTypes.INTEGER,
        field: 'empathy_score',
    },
    activenessScore: {
        type: DataTypes.INTEGER,
        field: 'activeness_score',
    },
    conversationRhythmScore: {
        type: DataTypes.INTEGER,
        field: 'conversation_rhythm_score',
    },
    personalityTags: {
        type: DataTypes.JSON,
        field: 'personality_tags',
    },
    strengths: {
        type: DataTypes.TEXT,
    },
    improvements: {
        type: DataTypes.TEXT,
    },
    detailedFeedback: {
        type: DataTypes.JSON,
        field: 'detailed_feedback',
    },
    analyzedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'analyzed_at',
    },
}, {
    tableName: 'chat_analysis',
    timestamps: false,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['total_score'] },
    ],
});

module.exports = ChatAnalysis;
