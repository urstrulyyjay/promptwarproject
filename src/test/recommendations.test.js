// src/test/recommendations.test.js
// Vanilla script intended for test-runners or manual assertion testing.

import { generateFoodRecommendation } from '../services/ai.js';

export const runTests = async () => {
    console.log("Running StadiumFlow Integration Tests...");
    const mockState = {
        foodQueues: {
            "stand1": { id: "stand1", name: "Stand 1", queueTime: 25 },
            "stand2": { id: "stand2", name: "Stand 2", queueTime: 5 }
        }
    };

    // Test offline fallback logic
    const res = await generateFoodRecommendation(mockState, "stand1");
    if (res.trigger && res.alternative.id === "stand2") {
        console.log("✅ Fallback food recommendation test passed.");
    } else {
        console.error("❌ Fallback food recommendation test failed.", res);
    }
};

// Auto-run if accessed directly or via runner
if(typeof window !== 'undefined') {
    window.runStadiumTests = runTests;
}
