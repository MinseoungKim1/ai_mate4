// 테이블 생성 스크립트
const { syncDatabase } = require('../models');

(async () => {
    console.log('🚀 데이터베이스 마이그레이션 시작...');

    // force: true - 기존 테이블 삭제 후 재생성 (주의!)
    // alter: true - 기존 테이블 구조 변경 (권장)
    await syncDatabase({ alter: true });

    console.log('✅ 마이그레이션 완료!');
    process.exit(0);
})();
