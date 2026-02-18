const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        dialectOptions: {
            timezone: '+09:00',
            charset: 'utf8mb4',
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true, // camelCase -> snake_case 자동 변환
        },
    }
);

// 연결 테스트
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MariaDB 연결 성공!');
    } catch (error) {
        console.error('❌ MariaDB 연결 실패:', error);
    }
};

testConnection();

module.exports = sequelize;
