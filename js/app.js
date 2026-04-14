// js/app.js
// Main UI Controller

const appController = {
    currentRole: null,

    initRole: function(role) {
        this.currentRole = role;
        const selector = document.getElementById('role-selector');
        if (selector) selector.classList.add('hidden');
        
        if(role === 'user') {
            const userApp = document.getElementById('user-app');
            if (userApp) userApp.classList.remove('hidden');
            this.initUserDashboard();
        } else {
            const adminApp = document.getElementById('admin-app');
            if (adminApp) adminApp.classList.remove('hidden');
            this.initAdminDashboard();
        }

        // Start UI polling for live updates
        if (!this.pollInterval) {
            this.pollInterval = setInterval(() => {
                if (this.currentRole === 'user' && document.getElementById('view-queues').classList.contains('active')) {
                    this.renderQueues();
                } else if (this.currentRole === 'admin') {
                    this.initAdminDashboard();
                }
            }, 3000);
        }
    },

    switchTab: function(tabId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        // Remove active state from nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Show active
        document.getElementById(`view-${tabId}`).classList.add('active');
        
        // Find the nav item and make active based on data-tab
        const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if(activeNav) {
            activeNav.classList.add('active');
        }

        // Add special hooks
        if(tabId === 'queues') {
            this.renderQueues();
        }
    },

    // --- USER LOGIC ---
    initUserDashboard: function() {
        // Run AI brain suggestions
        const bestGate = window.aiEngine.getBestGate();
        if(bestGate) {
            const gateEl = document.getElementById('suggested-gate');
            if (gateEl) gateEl.innerText = `${bestGate.name} (Only ${bestGate.avgWait}m wait)`;
        }

        const foodRec = window.aiEngine.getFoodRecommendation('stall1');
        if(foodRec && foodRec.trigger) {
            const foodSuggEl = document.getElementById('food-suggestion');
            if (foodSuggEl) {
                foodSuggEl.innerHTML = `
                    <i class="fa-solid fa-wand-magic-sparkles"></i> AI Tip: ${foodRec.message}
                `;
            }
            
            const aiSuggBox = document.getElementById('ai-suggestion-box');
            let alternativeName = foodRec.alternative ? foodRec.alternative.name : "another stall";
            let bestGateName = bestGate ? bestGate.name : "another gate";
            if (aiSuggBox) {
                aiSuggBox.innerHTML = `
                    <strong><i class="fa-solid fa-bolt"></i> Crowd Optimized Route Available</strong>
                    <span class="text-small">Switch to ${bestGateName} and pre-order from ${alternativeName} to save 35 minutes!</span>
                `;
            }
        }
    },

    acceptGateAlternative: function() {
        const bestGate = window.aiEngine.getBestGate();
        document.getElementById('assigned-gate').innerText = `${bestGate.name} (Rerouted)`;
        document.getElementById('assigned-gate').className = "text-success";
        alert("Route updated successfully! Check Maps for your new path.");
    },

    activateSmartRoute: function() {
        // WOW feature logic based on data state
        const routeStatus = window.aiEngine.checkRouteStatus();
        if (routeStatus && routeStatus.trigger) {
            document.getElementById('default-path').classList.add('hidden');
            document.getElementById('smart-path').classList.remove('hidden');
            
            const alertBox = document.getElementById('route-alert');
            alertBox.className = "recommendation-box glass border-success";
            alertBox.innerHTML = `
                <strong class="text-success"><i class="fa-solid fa-check-circle"></i> Smart Route Active</strong>
                <span class="text-small">You are avoiding the concourse jam. ETA reduced by 10 mins.</span>
            `;

            // Clear the congestion
            if (window.stadiumData && window.stadiumData.routes) {
                window.stadiumData.routes.currentRoute.status = 'clear';
            }
        } else {
            alert("Route is currently clear, no smart routing needed.");
        }
    },

    renderQueues: function() {
        const container = document.getElementById('queue-list');
        container.innerHTML = "";
        
        for(const key in window.stadiumData.food) {
            const item = window.stadiumData.food[key];
            let dotColor = item.queueTime > 15 ? "var(--danger)" : item.queueTime > 5 ? "var(--warning)" : "var(--success)";
            
            container.innerHTML += `
                <div class="card glass">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="margin-bottom:0.25rem;">${item.name}</h3>
                            <span class="text-muted"><i class="fa-solid fa-person-walking"></i> ${item.distance} away</span>
                        </div>
                        <div style="text-align:right;">
                            <strong style="color: ${dotColor}; font-size:1.2rem;">${item.queueTime}m</strong>
                            <div style="font-size:0.75rem; color: var(--text-muted);">Wait Time</div>
                        </div>
                    </div>
                    <button class="btn" style="width:100%; margin-top: 1rem; border-color: ${dotColor};">Join Virtual Queue</button>
                </div>
            `;
        }
    },

    // --- ADMIN LOGIC ---
    initAdminDashboard: function() {
        // Render Zones (Heatmap data)
        const zoneContainer = document.getElementById('admin-zones');
        zoneContainer.innerHTML = "";
        for(let key in window.stadiumData.zones) {
            const z = window.stadiumData.zones[key];
            let statusClass = z.density > 80 ? "danger" : z.density > 50 ? "warning" : "success";
            zoneContainer.innerHTML += `
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                        <span>${z.name}</span>
                        <span class="text-${statusClass}">${z.density}% Full</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${statusClass}" style="width: ${z.density}%"></div>
                    </div>
                </div>
            `;
        }

        // Render Gates
        const gateContainer = document.getElementById('admin-gates');
        gateContainer.innerHTML = "";
        for(let key in window.stadiumData.gates) {
            const g = window.stadiumData.gates[key];
            let btnAction = g.status === 'open' ? 'Close Gate' : 'Open Gate';
            let btnClass = g.status === 'open' ? 'btn-danger' : 'btn-primary';
            gateContainer.innerHTML += `
                <div class="stat-row flex-align-center">
                    <div>
                        <strong class="d-block">${g.name}</strong>
                        <span class="text-muted text-small">${g.crowdLevel}% Capacity • Wait: ${g.avgWait}m</span>
                    </div>
                    <button class="btn ${btnClass} btn-small" onclick="appController.toggleGate('${g.id}')">${btnAction}</button>
                </div>
            `;
        }
    },

    toggleGate: function(gateId) {
        if (!window.stadiumData || !window.stadiumData.gates[gateId]) return;
        const gate = window.stadiumData.gates[gateId];
        const newStatus = gate.status === 'open' ? 'closed' : 'open';
        gate.status = newStatus;
        
        this.appendAdminLog(`Gate ${gate.name} was ${newStatus.toUpperCase()}`);
        this.initAdminDashboard(); // Re-render immediately
    },

    appendAdminLog: function(message) {
        const logContainer = document.getElementById('admin-log');
        if (!logContainer) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = document.createElement('div');
        entry.className = 'text-small text-muted mb-1';
        entry.innerHTML = `[${time}] ${message}`;
        logContainer.prepend(entry);
    },

    triggerEmergency: function() {
        if(confirm("ALERT: Are you sure you want to trigger global evacuation routing? This will take over all user screens.")) {
            alert("Emergency routing activated. Users are being directed to nearest safe exits.");
        }
    },

    broadcastAlert: function() {
        let msg = prompt("Enter broadcast message for all users:", "Gate D is now open. Rerouting available.");
        if(msg) alert("Broadcast sent successfully!");
    }
};

window.appController = appController;
