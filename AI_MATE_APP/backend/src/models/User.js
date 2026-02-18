const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    nickname: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    kakaoId: {
        type: DataTypes.BIGINT,
        unique: true,
        field: 'kakao_id',
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    matchCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'match_count',
    },
    aiMatchCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'ai_match_count',
    },
    isPro: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_pro',
    },
    proExpiredAt: {
        type: DataTypes.DATE,
        field: 'pro_expired_at',
    },
    credit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        field: 'last_login_at',
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['email'] },
        { fields: ['kakao_id'] },
        { fields: ['gender', 'age'] },
    ],
});

// 비밀번호 해싱 (저장 전)
User.beforeCreate(async (user) => {
    if (user.password && user.password !== 'social_login') {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

// 비밀번호 검증 메서드
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// JSON 응답 시 비밀번호 제외
User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
