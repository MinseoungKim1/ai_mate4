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
const getAiResponse = async (messages, promptType = "chat", context = null) => {
    try {
        let systemPrompt = "";
        let responseFormat = { type: "text" };

        if (promptType === "analyze") {
            systemPrompt = process.env.AI_ANALYZE_PROMPT;
            responseFormat = { type: "json_object" };
        } else {
            systemPrompt = process.env.AI_CHAT_PROMPT || "당신은 사용자에게 도움을 주는 AI 조력자입니다.";

            // 💡 Context 반영: 사용자가 선택한 이상형 스타일 적용
            if (context && context.tags && context.tags.length > 0) {
                const tagString = context.tags.join(", ");
                systemPrompt += `\n\n[현재 사용자의 취향 정보]\n- 선호하는 스타일: ${tagString}\n- 선호하는 나이대: ${context.age || '상관없음'}\n\n위 정보를 참고하여, 당신은 사용자가 방금 선택한 '${tagString}' 매력을 가진 사람으로서 대화하세요. 해당 스타일의 특징이 말투와 행동에 자연스럽게 묻어나게 하세요.`;
            }
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Upgraded to gpt-4o for better analysis if needed, or keep gpt-4o-mini
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
