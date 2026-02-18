const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    user1Id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user1_id',
    },
    user2Id: {
        type: DataTypes.BIGINT,
        allowNull: true, // 매칭 전에는 null
        field: 'user2_id',
    },
    matchType: {
        type: DataTypes.ENUM('free', 'credit', 'pro'),
        allowNull: false,
        defaultValue: 'free',
        field: 'match_type',
    },
    compatibilityScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'compatibility_score',
    },
    matchingReason: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'matching_reason',
        comment: '{"commonInterests": ["미술"], "personalityMatch": 85}',
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    chatRoomId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'chat_room_id',
    },
    matchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'matched_at',
        defaultValue: DataTypes.NOW,
    },
    respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'responded_at',
    },
}, {
    tableName: 'matches',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['user1_id'] },
        { fields: ['user2_id'] },
        { fields: ['status'] },
        { fields: ['chat_room_id'] },
        { fields: ['matched_at'] },
    ],
});

module.exports = Match;
