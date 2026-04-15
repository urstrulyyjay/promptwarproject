// src/services/ai.js
// Gemini AI Service — graceful fallback to local logic
// NO top-level await

import { CONFIG } from '../config.js';

const isGeminiConfigured = CONFIG.GEMINI_API_KEY &&
    CONFIG.GEMINI_API_KEY !== "" &&
    CONFIG.GEMINI_API_KEY !== "your_gemini_api_key_here";

let _aiPromise = null;
function lazyInitAI() {
    if (!isGeminiConfigured) return Promise.resolve(null);
    if (_aiPromise) return _aiPromise;
    _aiPromise = (async () => {
        try {
            const { GoogleGenAI } = await import('https://esm.sh/@google/genai');
            console.log("Gemini AI initialized.");
            return new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });
        } catch (e) {
            console.warn("Gemini AI init failed, using local fallback:", e.message);
            return null;
        }
    })();
    return _aiPromise;
}

export const generateFoodRecommendation = async (stadiumState, preferredStallId) => {
    const ai = isGeminiConfigured ? await lazyInitAI() : null;

    // Fallback if API not configured
    if (!ai) {
        const preferred = stadiumState.foodQueues[preferredStallId];
        if (!preferred) return { trigger: false };
        if (preferred.queueTime > 15) {
            let bestAlt = Object.values(stadiumState.foodQueues).find(s => s.id !== preferredStallId && s.queueTime < 10);
            if (bestAlt) {
                return {
                    trigger: true,
                    message: `The ${preferred.name} line is ${preferred.queueTime} mins long. Go to ${bestAlt.name} instead (only ${bestAlt.queueTime} mins away).`,
                    alternative: bestAlt
                };
            }
        }
        return { trigger: false };
    }

    // Live Gemini Integration
    try {
        const prompt = `
            You are an AI crowd control assistant for a stadium.
            Current Food Stand queues: ${JSON.stringify(stadiumState.foodQueues)}
            The user wants to go to: ${preferredStallId}.
            If the queue is over 15 minutes, recommend the closest alternative with under 10 minutes wait time.
            Format your response strictly as JSON with keys: 'trigger' (boolean), 'message' (string advice), and 'alternativeId' (the id of the recommended stand, or null). No markdown block formatting.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const content = response.text.replace(/```json/g, '').replace(/```/g, '');
        const data = JSON.parse(content);
        
        return {
            trigger: data.trigger,
            message: data.message,
            alternative: data.alternativeId ? stadiumState.foodQueues[data.alternativeId] : null
        };
    } catch (e) {
        console.error("Gemini API Error:", e);
        return { trigger: false };
    }
};
