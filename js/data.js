// js/data.js
// The "Brain" and Data Layer

// Structured Mock Data for the Stadium
const stadiumData = {
    gates: {
        "gateA": { id: "gateA", name: "Gate A (North)", crowdLevel: 85, status: "open", avgWait: 25 },
        "gateB": { id: "gateB", name: "Gate B (South)", crowdLevel: 30, status: "open", avgWait: 5 },
        "gateC": { id: "gateC", name: "Gate C (VIP)", crowdLevel: 10, status: "open", avgWait: 2 },
        "gateD": { id: "gateD", name: "Gate D (East)", crowdLevel: 95, status: "closed", avgWait: 0 }
    },
    food: {
        "stall1": { id: "stall1", name: "Burger Stand (Sec 102)", queueTime: 22, distance: "2 mins" },
        "stall2": { id: "stall2", name: "Pizza Corner (Sec 104)", queueTime: 6, distance: "4 mins" },
        "stall3": { id: "stall3", name: "Drinks Bar (Sec 101)", queueTime: 3, distance: "1 min" }
    },
    zones: {
        "zone1": { name: "Concourse A", density: 75 },
        "zone2": { name: "Concourse B", density: 40 },
        "zone3": { name: "Merch Area", density: 90 }
    },
    routes: {
        // Mock routing status
        currentRoute: { 
            from: "Gate A", 
            to: "Seat (Sec 105)", 
            status: "congested", // congested, clear
            delay: "10 mins"
        }
    }
};

// Smart Recommendation Engine (The "Brain")
const aiEngine = {
    // Logic 1: Find the best gate based on lowest crowd level
    getBestGate: () => {
        let best = null;
        for (let key in stadiumData.gates) {
            let gate = stadiumData.gates[key];
            if (gate.status === "open") {
                if (!best || gate.crowdLevel < best.crowdLevel) {
                    best = gate;
                }
            }
        }
        return best;
    },

    // Logic 2: Food Recommendation
    getFoodRecommendation: (preferredStallId) => {
        const preferred = stadiumData.food[preferredStallId];
        // If queue is > 15 mins, suggest a faster alternative
        if (preferred && preferred.queueTime > 15) {
            let bestAlternative = null;
            for (let key in stadiumData.food) {
                let stall = stadiumData.food[key];
                if (key !== preferredStallId && stall.queueTime < 10) {
                    if (!bestAlternative || stall.queueTime < bestAlternative.queueTime) {
                        bestAlternative = stall;
                    }
                }
            }
            return {
                trigger: true,
                original: preferred,
                alternative: bestAlternative,
                message: `The ${preferred.name} line is ${preferred.queueTime} mins long. Go to ${bestAlternative.name} instead (only ${bestAlternative.queueTime} mins away).`
            };
        }
        return { trigger: false };
    },

    // Logic 3: Route optimization
    checkRouteStatus: () => {
        if (stadiumData.routes.currentRoute.status === "congested") {
             return {
                 trigger: true,
                 message: "Current route congested! Rerouting via Concourse B to save 10 mins.",
                 newRoute: "alternative"
             };
        }
        return { trigger: false };
    }
};

// Expose to window for app.js
window.stadiumData = stadiumData;
window.aiEngine = aiEngine;
