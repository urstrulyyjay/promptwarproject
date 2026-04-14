// src/services/ai.js
import { GoogleGenAI } from 'https://esm.sh/@google/genai';
import { CONFIG } from '../config.js';

let ai = null;
if (CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    ai = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });
}

export const generateFoodRecommendation = async (stadiumState, preferredStallId) => {
    // Fallback if API not configured
    if (!ai) {
        console.warn("Gemini Engine not configured. Using local fallback.");
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
