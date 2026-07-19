require('dotenv').config();
const axios = require('axios');

const API_KEYS = [
    process.env.originKey1,
    process.env.originKey2,
    process.env.originKey3
].filter(Boolean);

async function testGemini(text) {
    if (API_KEYS.length === 0) {
        console.error("No API keys found in .env");
        return;
    }

    const key = API_KEYS[0];
    const prompt = `
        You are a strict AI Nutritionist. 
        Analyze this description: "${text}". 
        
        FIRST, determine if the input represents actual food or a meal. 
        If it is NOT food, return exactly this JSON:
        {"error": "Not recognized as food. Please scan a valid meal."}

        If it IS food, return ONLY a JSON object with this EXACT structure (use raw numbers for macros, no strings):
        {
            "foodItems": ["Name of Item 1", "Name of Item 2"],
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "confidence": 0.9
        }
        If it's an Indian meal like "2 roti", be precise about Indian nutrition standards.
        CRITICAL: Output ONLY the raw JSON object. Do not wrap in markdown \`\`\` or add any conversational text.
    `;

    try {
        console.log(`Testing Gemini API with text: "${text}"`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const contents = [{ parts: [{ text: prompt }] }];

        const response = await axios.post(url, { contents }, { timeout: 15000 });
        const resultText = response.data.candidates[0].content.parts[0].text;

        console.log("--- RAW GEMINI OUTPUT ---");
        console.log(resultText);
        console.log("-------------------------");

        try {
            const cleanJson = resultText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            console.log("SUCCESSFULLY PARSED JSON:");
            console.log(parsed);
        } catch (e) {
            console.error("Failed to parse JSON", e);
        }

    } catch (err) {
        console.error("Gemini API Error:", err.message);
        if (err.response) {
            console.error(err.response.data);
        }
    }
}

testGemini("2 Roti with chicken curry");
