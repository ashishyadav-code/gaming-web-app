import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Keys Configuration (loaded from environment; do NOT hardcode secrets)
const GROQ_KEYS = [
    import.meta.env.VITE_GROQ_KEY_1
].filter(Boolean);

// Model Rotation for Groq
const GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3-32b",
    "groq/compound",
    "openai/gpt-oss-20b",
    "groq/compound-mini",
    "canopylabs/orpheus-v1-english"
];

const GEMINI_KEYS = [
    import.meta.env.VITE_ORIGIN_KEY_1,
    import.meta.env.VITE_ORIGIN_KEY_2,
    import.meta.env.VITE_ORIGIN_KEY_3
].filter(Boolean);

let currentGroqKeyIndex = 0;
let currentGroqModelIndex = 0;
let currentGeminiIndex = 0;

/**
 * Universal AI Caller with Multi-Model & Multi-Key Rotation
 */
async function callAI(prompt, systemPrompt = "You are an Esports Analyst for SARKAR Guild.") {
    // 1. Try Groq with Model Rotation
    for (let m = 0; m < GROQ_MODELS.length; m++) {
        const model = GROQ_MODELS[currentGroqModelIndex];

        for (let k = 0; k < GROQ_KEYS.length; k++) {
            const key = GROQ_KEYS[currentGroqKeyIndex];
            try {
                const groq = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    model: model,
                    temperature: 0.8,
                    max_tokens: 1024,
                });
                return completion.choices[0]?.message?.content || "";
            } catch (err) {
                console.error(`Groq Model ${model} with Key ${currentGroqKeyIndex + 1} failed...`, err);
                currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_KEYS.length;
            }
        }
        // If all keys fail for this model, move to next model
        currentGroqModelIndex = (currentGroqModelIndex + 1) % GROQ_MODELS.length;
    }

    // 2. Fallback to Gemini
    console.warn("All Groq models/keys failed. Falling back to Gemini...");
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        const key = GEMINI_KEYS[currentGeminiIndex];
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 Flash as stable, but user mentioned 3-flash-preview. I'll use a widely available one or try their suggestion.
            const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
            const response = await result.response;
            let text = response.text();
            // Final polish: remove emojis and markdown for safety
            return text.replace(/[\u1F600-\u1F64F]|[\u2700-\u27BF]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u1F1E0-\u1F1FF]/g, "").replace(/\*\*/g, "");
        } catch (err) {
            console.error(`Gemini Key ${currentGeminiIndex + 1} failed, rotating...`, err);
            currentGeminiIndex = (currentGeminiIndex + 1) % GEMINI_KEYS.length;
        }
    }

    throw new Error("All AI Engines (Groq & Gemini) unavailable.");
}

/**
 * Player Comparison with Styled Output
 */
export async function getAIPlayerComparison(playerA, playerB, category = 'tourney') {
    const statsA = playerA.stats?.[category] || { kills: 0, matches: 0, wins: 0 };
    const statsB = playerB.stats?.[category] || { kills: 0, matches: 0, wins: 0 };

    const prompt = `
        Compare these players. Use ONLY these symbols for styling:
        - Use '➤' for key points.
        - Use '🔥' for strengths.
        - Use '💡' for advice.
        - DO NOT use markdown bold stars (**).
        - Keep content concise.

        PLAYER A: ${playerA.name} (Kills: ${statsA.kills}, Matches: ${statsA.matches}, Wins: ${statsA.wins})
        PLAYER B: ${playerB.name} (Kills: ${statsB.kills}, Matches: ${statsB.matches}, Wins: ${statsB.wins})

        STRUCTURE:
        ANALYSIS: (2 points)
        VERDICT: (1 line impact verdict)
    `;

    return callAI(prompt, 'You are an Esports Analyst for SARKAR Guild. Your tone is professional and sharp.');
}

/**
 * Tournament Prediction with Chemistry logic
 */
export async function getAITournamentPrediction(tournament, allMembers) {
    const participantsData = (tournament.participants || []).map(p => {
        const member = allMembers.find(m => m.uid === p.uid);
        return {
            name: p.name,
            uid: p.uid,
            totalKills: member?.stats?.tourney?.kills || 0,
            matches: member?.stats?.tourney?.matches || 0,
            wins: member?.stats?.tourney?.wins || 0
        };
    });

    const prompt = `
        Analyze participants for: "${tournament.title}".
        DATA: ${JSON.stringify(participantsData)}
        
        INSTRUCTIONS:
        1. Calculate win % (sum 100).
        2. Identify "The Underdog" and "The Favourite".
        3. Provide 3 short overview points using '➤'.
        4. Return ONLY valid JSON:
        {
            "predictions": [ {"name": "Player Name", "percentage": 45, "isTop": true} ],
            "overview": ["Point 1", "Point 2", "Point 3"]
        }
    `;

    try {
        const responseText = await callAI(prompt, 'You are "SARKAR AI", a high-level Esports Predictor.');
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (err) {
        console.error("AI Prediction Parsing failed", err);
        return null;
    }
}
/**
 * Generate Home Panel Content with AI
 */
export async function getAIHomePanelContent(prompt) {
    const systemPrompt = "You are an AI Content Creator for SARKAR Guild. Create a professional, exciting announcement. NO EMOJIS. NO MARKDOWN BOLD (**). Use '➤' for bullet points. Keep it clear, structured and impactful.";

    const fullPrompt = `
        Draft a "What's New" announcement based on this info: ${prompt}
        
        INSTRUCTIONS:
        - DO NOT use ** for bold.
        - Use clean lines and '➤' for features.
        - Ensure the output is raw text that looks premium.

        STRUCTURE:
        TITLE: (Short catchy title)
        SUBTITLE: (One line context)
        FEATURES: (List 3-4 key features using '➤')
    `;

    return callAI(fullPrompt, systemPrompt);
}
