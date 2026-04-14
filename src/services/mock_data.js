// js/data.js
// The "Brain" and Data Layer

// Structured Mock Data for the Stadium
export const stadiumData = {
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
export const aiEngine = {
    // Logic 1: Find the best gate based on lowest crowd level
    getBestGate: () => {
        let best = null;
        if (!stadiumData || !stadiumData.gates) return null;
        
        for (let key in stadiumData.gates) {
            let gate = stadiumData.gates[key];
            if (gate && gate.status === "open") {
                if (!best || gate.crowdLevel < best.crowdLevel) {
                    best = gate;
                }
            }
        }
        return best;
    },

    // Logic 2: Food Recommendation
    getFoodRecommendation: (preferredStallId) => {
        if (!stadiumData || !stadiumData.food) return { trigger: false };
        const preferred = stadiumData.food[preferredStallId];
        
        if (!preferred) return { trigger: false };

        // If queue is > 15 mins, suggest a faster alternative
        if (preferred.queueTime > 15) {
            let bestAlternative = null;
            for (let key in stadiumData.food) {
                let stall = stadiumData.food[key];
                if (key !== preferredStallId && stall && stall.queueTime < 10) {
                    if (!bestAlternative || stall.queueTime < bestAlternative.queueTime) {
                        bestAlternative = stall;
                    }
                }
            }
            if (bestAlternative) {
                return {
                    trigger: true,
                    original: preferred,
                    alternative: bestAlternative,
                    message: `The ${preferred.name} line is ${preferred.queueTime} mins long. Go to ${bestAlternative.name} instead (only ${bestAlternative.queueTime} mins away).`
                };
            }
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

// Live Simulation Jitter
function simulateLiveUpdates() {
    // Randomize queues
    for (let key in stadiumData.food) {
        let diff = Math.floor(Math.random() * 5) - 2; // -2 to +2
        stadiumData.food[key].queueTime = Math.max(0, stadiumData.food[key].queueTime + diff);
    }
    // Randomize zones
    for (let key in stadiumData.zones) {
        let diff = Math.floor(Math.random() * 11) - 5; // -5 to +5
        stadiumData.zones[key].density = Math.max(0, Math.min(100, stadiumData.zones[key].density + diff));
    }
    // Randomize gates
    for (let key in stadiumData.gates) {
        if (stadiumData.gates[key].status === 'open') {
            let diff = Math.floor(Math.random() * 5) - 2;
            stadiumData.gates[key].crowdLevel = Math.max(0, Math.min(100, stadiumData.gates[key].crowdLevel + diff));
            stadiumData.gates[key].avgWait = Math.max(0, Math.floor(stadiumData.gates[key].crowdLevel * 0.3));
        }
    }
}

// Start simulation immediately so data feels alive
setInterval(simulateLiveUpdates, 3000);
