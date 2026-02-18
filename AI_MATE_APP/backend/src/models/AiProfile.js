const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiProfile = sequelize.define('AiProfile', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    appearance: {
        type: DataTypes.JSON,
        comment: 'JSON: height, style, hairColor 등',
    },
    personalityTags: {
        type: DataTypes.JSON,
        field: 'personality_tags',
        comment: 'Array: ["지적인", "차분한", "예술적인"]',
    },
    personaDescription: {
        type: DataTypes.TEXT,
        field: 'persona_description',
    },
    speakingStyle: {
        type: DataTypes.STRING(50),
        field: 'speaking_style',
        comment: 'formal/casual/cute 등',
    },
    hobbies: {
        type: DataTypes.JSON,
        comment: 'Array: ["미술관", "독서", "영화감상"]',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
    },
}, {
    tableName: 'ai_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['gender'] },
        { fields: ['is_active'] },
    ],
});

module.exports = AiProfile;
