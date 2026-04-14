// src/app.js
// Main UI Controller (Refactored for Security & Modularity)

import { watchAuthState, loginAsRole, logout } from './services/auth.js';
import { stadiumState, onGatesUpdate, onFoodUpdate, toggleGateStatus } from './services/db.js';
import { generateFoodRecommendation } from './services/ai.js';
import { initGoogleMap } from './services/maps.js';
import { stadiumData } from './services/mock_data.js'; // Fallback import

// Quick populate initial global state fallback so the UI isn't utterly blank
Object.assign(stadiumState.gates, stadiumData.gates);
Object.assign(stadiumState.foodQueues, stadiumData.food);
Object.assign(stadiumState.zones, stadiumData.zones);

let currentRole = null;

// --- Initialize App ---
function initApp() {
    console.log("App loaded");

    // 1. Static Event Listeners (Security: No inline onclick)
    document.getElementById('btn-role-user')?.addEventListener('click', () => {
        console.log("User button clicked");
        
        // Direct DOM manipulation mapping instead of Firebase
        currentRole = 'user';
        document.getElementById('role-selector')?.classList.add('hidden');
        document.getElementById('user-app')?.classList.remove('hidden');
        
        initUserDashboard();
    });
    document.getElementById('btn-role-admin')?.addEventListener('click', () => {
        console.log("Admin button clicked");
        
        // Direct DOM manipulation mapping instead of Firebase
        currentRole = 'admin';
        document.getElementById('role-selector')?.classList.add('hidden');
        document.getElementById('admin-app')?.classList.remove('hidden');
        
        initAdminDashboard();
    });
    document.getElementById('btn-admin-exit')?.addEventListener('click', () => { 
        console.log("Exit button clicked");
        location.reload(); logout(); 
    });
    document.getElementById('btn-accept-gate')?.addEventListener('click', () => {
        console.log("Accept gate button clicked");
        acceptGateAlternative();
    });
    document.getElementById('btn-activate-route')?.addEventListener('click', () => {
        console.log("Activate route clicked");
        activateSmartRoute();
    });
    document.getElementById('btn-trigger-emergency')?.addEventListener('click', triggerEmergency);
    document.getElementById('btn-broadcast-alert')?.addEventListener('click', broadcastAlert);
    // 2. Navigation Binding
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', (e) => {
            switchTab(e.currentTarget.dataset.tab);
        });
    });

    // 3. Auth Listener Setup
    watchAuthState(
        () => {
            currentRole = 'user';
            document.getElementById('role-selector').classList.add('hidden');
            document.getElementById('user-app').classList.remove('hidden');
            initUserDashboard();
        },
        () => {
            currentRole = 'admin';
            document.getElementById('role-selector').classList.add('hidden');
            document.getElementById('admin-app').classList.remove('hidden');
            initAdminDashboard();
        },
        () => {
            currentRole = null;
            document.getElementById('user-app').classList.add('hidden');
            document.getElementById('admin-app').classList.add('hidden');
            document.getElementById('role-selector').classList.remove('hidden');
        }
    );

    // 4. Data Listeners (Live Sync)
    onGatesUpdate((gates) => {
        if (currentRole === 'admin') renderAdminGates(gates);
    });
    onFoodUpdate((queues) => {
        if (currentRole === 'user' && document.getElementById('view-queues').classList.contains('active')) {
            renderQueues(queues);
        }
    });

    // Polling simulation for UI updates (Since we run without a true real-time websocket here)
    setInterval(() => {
        if (currentRole === 'user' && document.getElementById('view-queues').classList.contains('active')) {
            renderQueues(stadiumState.foodQueues);
        } else if (currentRole === 'admin') {
            renderAdminZones(); // Refresh heatmaps
            renderAdminGates(stadiumState.gates);
        }
    }, 4000);
}

// --- Navigation ---
function switchTab(tabId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`view-${tabId}`).classList.add('active');

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    if (tabId === 'queues') renderQueues(stadiumState.foodQueues);
    if (tabId === 'map') initGoogleMap('stadium-map'); // Connect to Google Maps
}

// --- User Features ---
function getBestGateLocal() {
    let best = null;
    for (let key in stadiumState.gates) {
        let gate = stadiumState.gates[key];
        if (gate && gate.status === "open") {
            if (!best || gate.crowdLevel < best.crowdLevel) best = gate;
        }
    }
    return best;
}

async function initUserDashboard() {
    const bestGate = getBestGateLocal();
    if (bestGate) {
        const gateEl = document.getElementById('suggested-gate');
        if (gateEl) gateEl.textContent = `${bestGate.name} (Only ${bestGate.avgWait}m wait)`;
    }

    const foodRec = await generateFoodRecommendation(stadiumState, 'stall1');
    if (foodRec && foodRec.trigger) {
        const foodSuggEl = document.getElementById('food-suggestion');
        if (foodSuggEl) foodSuggEl.textContent = `⚡ AI Tip: ${foodRec.message}`;

        const aiSuggBox = document.getElementById('ai-suggestion-box');
        let altName = foodRec.alternative ? foodRec.alternative.name : "another stall";
        let gateName = bestGate ? bestGate.name : "another gate";
        if (aiSuggBox) {
            // Secure rendering
            aiSuggBox.innerHTML = ""; // Clear existing
            const str1 = document.createElement('strong');
            str1.textContent = `⚡ Crowd Optimized Route Available`;
            const span1 = document.createElement('span');
            span1.className = "text-small d-block mt-05";
            span1.textContent = `Switch to ${gateName} and pre-order from ${altName} to save 35 minutes!`;
            aiSuggBox.appendChild(str1);
            aiSuggBox.appendChild(span1);
        }
    }
}

function acceptGateAlternative() {
    const bestGate = getBestGateLocal();
    const assigned = document.getElementById('assigned-gate');
    if (assigned) {
        assigned.textContent = `${bestGate.name} (Rerouted)`;
        assigned.className = "text-success";
    }
    alert("Route updated successfully! Check Maps for your new path.");
}

function activateSmartRoute() {
    document.getElementById('default-path')?.classList.add('hidden');
    document.getElementById('smart-path')?.classList.remove('hidden');

    const alertBox = document.getElementById('route-alert');
    if (alertBox) {
        alertBox.className = "recommendation-box glass border-success mt-1";
        alertBox.innerHTML = "";
        const strong = document.createElement('strong');
        strong.className = "text-success d-block";
        strong.textContent = "✔ Smart Route Active";
        const span = document.createElement('span');
        span.className = "text-small";
        span.textContent = "You are avoiding the concourse jam. ETA reduced by 10 mins.";
        alertBox.appendChild(strong);
        alertBox.appendChild(span);
    }
}

function renderQueues(data) {
    const container = document.getElementById('queue-list');
    if (!container) return;
    container.innerHTML = ""; // Secure clear

    for (const key in data) {
        const item = data[key];
        let dotColor = item.queueTime > 15 ? "var(--danger)" : item.queueTime > 5 ? "var(--warning)" : "var(--success)";

        const card = document.createElement('div');
        card.className = "card glass";

        const flex1 = document.createElement('div');
        flex1.style.display = "flex";
        flex1.style.justifyContent = "space-between";
        flex1.style.alignItems = "center";

        const txtBox = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.style.marginBottom = "0.25rem";
        h3.textContent = item.name;
        const sub = document.createElement('span');
        sub.className = "text-muted text-small";
        sub.textContent = `${item.distance} away`;
        txtBox.appendChild(h3);
        txtBox.appendChild(sub);

        const rBox = document.createElement('div');
        rBox.style.textAlign = "right";
        const strong = document.createElement('strong');
        strong.style.color = dotColor;
        strong.style.fontSize = "1.2rem";
        strong.textContent = `${item.queueTime}m`;
        const mini = document.createElement('div');
        mini.className = "text-small text-muted";
        mini.textContent = "Wait Time";
        rBox.appendChild(strong);
        rBox.appendChild(mini);

        flex1.appendChild(txtBox);
        flex1.appendChild(rBox);

        const btn = document.createElement('button');
        btn.className = "btn w-100 mt-1";
        btn.style.borderColor = dotColor;
        btn.textContent = "Join Virtual Queue";

        card.appendChild(flex1);
        card.appendChild(btn);
        container.appendChild(card);
    }
}

// --- Admin Features ---
function initAdminDashboard() {
    renderAdminZones();
    renderAdminGates(stadiumState.gates);
}

function renderAdminZones() {
    const container = document.getElementById('admin-zones');
    if (!container) return;
    container.innerHTML = "";

    for (let key in stadiumState.zones) {
        const z = stadiumState.zones[key];
        let statusClass = z.density > 80 ? "danger" : z.density > 50 ? "warning" : "success";

        const wrap = document.createElement('div');
        wrap.className = "mb-1";

        const flex = document.createElement('div');
        flex.className = "flex-align-center text-small mb-05";

        const span1 = document.createElement('span');
        span1.textContent = z.name;
        const span2 = document.createElement('span');
        span2.className = `text-${statusClass}`;
        span2.textContent = `${z.density}% Full`;
        flex.appendChild(span1);
        flex.appendChild(span2);

        const probBar = document.createElement('div');
        probBar.className = "progress-bar";
        const probFill = document.createElement('div');
        probFill.className = `progress-fill ${statusClass}`;
        probFill.style.width = `${z.density}%`;
        probBar.appendChild(probFill);

        wrap.appendChild(flex);
        wrap.appendChild(probBar);
        container.appendChild(wrap);
    }
}

function renderAdminGates(gates) {
    const container = document.getElementById('admin-gates');
    if (!container) return;
    container.innerHTML = "";

    for (let key in gates) {
        const g = gates[key];
        const btnAction = g.status === 'open' ? 'Close Gate' : 'Open Gate';
        const btnClass = g.status === 'open' ? 'btn-danger' : 'btn-primary';

        const row = document.createElement('div');
        row.className = "stat-row flex-align-center";

        const detail = document.createElement('div');
        const strong = document.createElement('strong');
        strong.className = "d-block";
        strong.textContent = g.name;
        const mute = document.createElement('span');
        mute.className = "text-muted text-small";
        mute.textContent = `${g.crowdLevel}% Capacity • Wait: ${g.avgWait}m`;
        detail.appendChild(strong);
        detail.appendChild(mute);

        const btn = document.createElement('button');
        btn.className = `btn ${btnClass} btn-small`;
        btn.textContent = btnAction;
        btn.addEventListener('click', () => {
            toggleGateStatus(g.id, g.status); // Firebase sync
            const newStatus = g.status === 'open' ? 'closed' : 'open';
            appendAdminLog(`Gate ${g.name} was ${newStatus.toUpperCase()}`);
            g.status = newStatus; // Local sync mock fallback
            renderAdminGates(gates);
        });

        row.appendChild(detail);
        row.appendChild(btn);
        container.appendChild(row);
    }
}

function appendAdminLog(message) {
    const logContainer = document.getElementById('admin-log');
    if (!logContainer) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement('div');
    entry.className = 'text-small text-muted mb-1';
    entry.textContent = `[${time}] ${message}`;
    logContainer.prepend(entry);
}

function triggerEmergency() {
    if (confirm("ALERT: Are you sure you want to trigger global evacuation routing?")) {
        appendAdminLog("SYSTEM: Emergency Evacuation Triggered globally.");
        alert("Emergency routing activated. Users directed to nearest exits.");
    }
}

function broadcastAlert() {
    let msg = prompt("Enter broadcast message for all users:");
    if (msg) {
        appendAdminLog(`BROADCAST: ${msg}`);
        alert("Broadcast sent successfully!");
    }
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
