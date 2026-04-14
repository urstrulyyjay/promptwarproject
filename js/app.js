// js/app.js
// Main UI Controller

const appController = {
    currentRole: null,

    initRole: function(role) {
        this.currentRole = role;
        document.getElementById('role-selector').classList.add('hidden');
        
        if(role === 'user') {
            document.getElementById('user-app').classList.remove('hidden');
            this.initUserDashboard();
        } else {
            document.getElementById('admin-app').classList.remove('hidden');
            this.initAdminDashboard();
        }
    },

    switchTab: function(tabId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        // Remove active state from nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Show active
        document.getElementById(`view-${tabId}`).classList.add('active');
        
        // Find the nav item and make active (using poor man's matching based on icon)
        let index = ['home', 'map', 'queues'].indexOf(tabId);
        if(index >= 0) {
            document.querySelectorAll('.nav-item')[index].classList.add('active');
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
            document.getElementById('suggested-gate').innerText = `${bestGate.name} (Only ${bestGate.avgWait}m wait)`;
        }

        const foodRec = window.aiEngine.getFoodRecommendation('stall1');
        if(foodRec.trigger) {
            document.getElementById('food-suggestion').innerHTML = `
                <i class="fa-solid fa-wand-magic-sparkles"></i> AI Tip: ${foodRec.message}
            `;
            
            document.getElementById('ai-suggestion-box').innerHTML = `
                <strong><i class="fa-solid fa-bolt"></i> Crowd Optimized Route Available</strong>
                <span style="font-size:0.9rem;">Switch to ${bestGate.name} and pre-order from ${foodRec.alternative.name} to save 35 minutes!</span>
            `;
        }
    },

    acceptGateAlternative: function() {
        const bestGate = window.aiEngine.getBestGate();
        document.getElementById('assigned-gate').innerText = `${bestGate.name} (Rerouted)`;
        document.getElementById('assigned-gate').className = "text-success";
        alert("Route updated successfully! Check Maps for your new path.");
    },

    activateSmartRoute: function() {
        // WOW feature logic
        document.getElementById('default-path').classList.add('hidden');
        document.getElementById('smart-path').classList.remove('hidden');
        
        const alertBox = document.getElementById('route-alert');
        alertBox.className = "recommendation-box glass border-success";
        alertBox.style.borderColor = "var(--success)";
        alertBox.innerHTML = `
            <strong class="text-success"><i class="fa-solid fa-check-circle"></i> Smart Route Active</strong>
            <span style="font-size:0.9rem;">You are avoiding the concourse jam. ETA reduced by 10 mins.</span>
        `;
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
                <div class="stat-row" style="align-items:center;">
                    <div>
                        <strong style="display:block;">${g.name}</strong>
                        <span class="text-muted text-small">${g.crowdLevel}% Capacity • Wait: ${g.avgWait}m</span>
                    </div>
                    <button class="btn ${btnClass}" style="padding: 0.4rem 0.8rem; font-size:0.8rem;" onclick="alert('Command sent to ${g.name}')">${btnAction}</button>
                </div>
            `;
        }
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
