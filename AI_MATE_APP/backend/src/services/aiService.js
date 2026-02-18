const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get AI response from OpenAI GPT model
 * @param {Array} messages - Array of message objects [{role: 'user', content: '...'}, ...]
 * @param {string} promptType - 'chat' or 'analyze'
 * @param {Object} context - Optional context {tags: [], age: ''}
 * @returns {Promise<string|Object>} - AI generated text (or parsed JSON object)
 */
const personalityModules = require("../utils/personalityModules");

/**
 * Get AI response from OpenAI GPT model
 * @param {Array} messages - Array of message objects [{role: 'user', content: '...'}, ...]
 * @param {string} promptType - 'chat' or 'analyze'
 * @param {Object} context - Optional context {tags: [], age: ''}
 * @returns {Promise<string|Object>} - AI generated text (or parsed JSON object)
 */
const getAiResponse = async (messages, promptType = "chat", context = null) => {
    try {
        let systemPrompt = "";
        let responseFormat = { type: "text" };

        if (promptType === "analyze") {
            systemPrompt = process.env.AI_ANALYZE_PROMPT;
            responseFormat = { type: "json_object" };
        } else {
            // 기본 프롬프트 로드
            let basePrompt = process.env.AI_CHAT_PROMPT || "당신은 사용자에게 도움을 주는 AI 조력자입니다.";

            // 💡 [성격 모듈 동적 조립 로직]
            if (context && context.tags && context.tags.length > 0) {
                const userTags = context.tags;
                const ageGroup = context.age || "알 수 없음";

                // 1. 모듈 수집
                let activeInstructions = "";
                let activeTone = "";

                userTags.forEach((tag, index) => {
                    const module = personalityModules[tag];
                    if (module) {
                        activeInstructions += module.instructions + "\n";

                        // 첫 번째 태그가 '말투'를 지배 (Dominant Tone)
                        if (index === 0) {
                            activeTone = module.tone;
                        }
                    }
                });

                // 2. 프롬프트 결합
                systemPrompt = `${basePrompt}

[현재 사용자의 정보]
- 선호 나이대: ${ageGroup}
- 선택한 이상형 키워드: ${userTags.join(", ")}

[스타일 적용 규칙 (System Override)]
사용자가 선택한 태그에 따라 당신의 성격과 행동 패턴을 재설정합니다.
1. 말투(Tone): ${activeTone || "기본 '지아'의 친근한 말투"}
2. 사고방식 및 행동 지침:
${activeInstructions}

위 지침을 최우선으로 적용하여 대화를 진행하세요. 선택된 태그들의 특성이 자연스럽게 융합되어 하나의 입체적인 캐릭터로 느껴져야 합니다.`;
            } else {
                systemPrompt = basePrompt;
            }
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Use gpt-4o-mini as the most cost-effective model
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: promptType === "analyze" ? 1000 : 500,
            response_format: responseFormat,
        });

        const content = response.choices[0].message.content;
        return promptType === "analyze" ? JSON.parse(content) : content;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("AI 처리 중 오류가 발생했습니다.");
    }
};

module.exports = {
    getAiResponse,
};
