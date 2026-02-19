const axios = require('axios');

/**
 * ntfy.sh 서비스
 */
const ntfyService = {
    /**
     * 메시지 전송
     * @param {string} topic - ntfy 토픽
     * @param {string} message - 내용
     * @param {Object} options - 추가 옵션 (title, tags, priority 등)
     */
    async publish(topic, message, options = {}) {
        try {
            const url = `https://ntfy.sh/${topic}`;
            const headers = {
                'Title': options.title || 'AI Mate 알림',
                'Tags': options.tags || 'speech_balloon',
                'Priority': options.priority || 'default',
            };

            const response = await axios.post(url, message, { headers });
            return response.data;
        } catch (error) {
            console.error(`[ntfy] Publish Error (topic: ${topic}):`, error.message);
            // 에러가 발생해도 전체 로직이 중단되지 않도록 로그만 남김
            return null;
        }
    },

    /**
     * 유저 정보를 기반으로 ntfy 토픽 생성
     * 형식: YYYYMMDD-gender-score
     * @param {Object} user - 유저 객체
     * @param {number} score - 최근 분석 점수 (없으면 0)
     */
    generateUserTopic(user, score = 0) {
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const gender = user.gender || 'unknown';
        const roundedScore = Math.round(score);
        
        return `${dateStr}-${gender}-${roundedScore}`;
    }
};

module.exports = ntfyService;
