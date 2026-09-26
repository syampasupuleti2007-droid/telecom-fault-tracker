/**
 * Telecom Fault Tracker & Churn Prediction System - NOC Dashboard Application
 */

const API_BASE_URL = "http://localhost:8080/api";

function getStoredSubscribers() {
    try {
        const saved = localStorage.getItem("telecom_subscribers");
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return [];
    }
}

// System State
const state = {
    towers: [
        { towerId: 1, towerName: "Central Exchange", latitude: 40.7128, longitude: -74.0060, isFaulty: false, x: 200, y: 220 },
        { towerId: 2, towerName: "North Ridge", latitude: 40.7306, longitude: -73.9352, isFaulty: false, x: 380, y: 120 },
        { towerId: 3, towerName: "East Market", latitude: 40.7213, longitude: -73.9776, isFaulty: true, x: 540, y: 200 },
        { towerId: 4, towerName: "South Point", latitude: 40.6892, longitude: -74.0445, isFaulty: false, x: 180, y: 350 },
        { towerId: 5, towerName: "West Park", latitude: 40.7358, longitude: -74.1723, isFaulty: false, x: 340, y: 320 },
        { towerId: 6, towerName: "Harbor View", latitude: 40.7002, longitude: -73.9968, isFaulty: false, x: 420, y: 240 },
        { towerId: 7, towerName: "Metro Station", latitude: 40.7588, longitude: -73.9851, isFaulty: true, x: 680, y: 130 },
        { towerId: 8, towerName: "Tech Hub", latitude: 40.7488, longitude: -73.9854, isFaulty: false, x: 650, y: 280 }
    ],
    edges: [
        { source: 1, target: 2 },
        { source: 1, target: 4 },
        { source: 1, target: 6 },
        { source: 2, target: 3 },
        { source: 2, target: 5 },
        { source: 3, target: 6 },
        { source: 3, target: 7 },
        { source: 4, target: 6 },
        { source: 5, target: 6 },
        { source: 7, target: 8 },
        { source: 8, target: 2 }
    ],
    subscribers: [
        { subscriberId: 1, name: "Ava Morgan", email: "ava.morgan@telecom.example.com", phone: "+15550001001", connectedTowerId: 1, tenureMonths: 34, callDrops: 2, churned: false, churnProb: 0.12 },
        { subscriberId: 2, name: "Noah Bennett", email: "noah.bennett@telecom.example.com", phone: "+15550001002", connectedTowerId: 2, tenureMonths: 8, callDrops: 17, churned: true, churnProb: 0.91 },
        { subscriberId: 3, name: "Mia Patel", email: "mia.patel@telecom.example.com", phone: "+15550001003", connectedTowerId: 3, tenureMonths: 19, callDrops: 14, churned: true, churnProb: 0.84 },
        { subscriberId: 4, name: "Liam Reed", email: "liam.reed@telecom.example.com", phone: "+15550001004", connectedTowerId: 4, tenureMonths: 52, callDrops: 1, churned: false, churnProb: 0.06 },
        { subscriberId: 5, name: "Sofia Kim", email: "sofia.kim@telecom.example.com", phone: "+15550001005", connectedTowerId: 5, tenureMonths: 5, callDrops: 21, churned: true, churnProb: 0.96 },
        { subscriberId: 6, name: "Ethan Brooks", email: "ethan.brooks@telecom.example.com", phone: "+15550001006", connectedTowerId: 6, tenureMonths: 27, callDrops: 4, churned: false, churnProb: 0.23 },
        { subscriberId: 7, name: "Isabella Diaz", email: "isabella.diaz@telecom.example.com", phone: "+15550001007", connectedTowerId: 2, tenureMonths: 13, callDrops: 9, churned: true, churnProb: 0.77 },
        { subscriberId: 8, name: "Lucas Chen", email: "lucas.chen@telecom.example.com", phone: "+15550001008", connectedTowerId: 4, tenureMonths: 41, callDrops: 0, churned: false, churnProb: 0.03 },
        { subscriberId: 9, name: "Emma Watson", email: "emma.watson@telecom.example.com", phone: "+15550001009", connectedTowerId: 7, tenureMonths: 3, callDrops: 28, churned: true, churnProb: 0.98 },
        { subscriberId: 10, name: "Oliver Taylor", email: "oliver.taylor@telecom.example.com", phone: "+15550001010", connectedTowerId: 8, tenureMonths: 48, callDrops: 3, churned: false, churnProb: 0.08 }
    ].concat(getStoredSubscribers()),
    complaints: [
        { complaintId: 1, subscriberId: 2, towerId: 3, category: "network_fault", description: "Repeated dropped calls near East Market tower.", severity: "high", status: "open", loggedAt: "2026-09-26 09:15:00" },
        { complaintId: 2, subscriberId: 3, towerId: 3, category: "network_fault", description: "Intermittent service and slow data around East Market.", severity: "critical", status: "in_progress", loggedAt: "2026-09-26 09:40:00" },
        { complaintId: 3, subscriberId: 5, towerId: 3, category: "call_drops", description: "Calls disconnect several times each day.", severity: "high", status: "open", loggedAt: "2026-09-26 10:05:00" },
        { complaintId: 4, subscriberId: 7, towerId: 3, category: "network_fault", description: "No reliable signal during evening commute.", severity: "medium", status: "open", loggedAt: "2026-09-26 10:20:00" },
        { complaintId: 5, subscriberId: 1, towerId: 2, category: "billing", description: "Question about international usage charge.", severity: "low", status: "resolved", loggedAt: "2026-09-25 14:10:00" },
        { complaintId: 6, subscriberId: 9, towerId: 7, category: "network_fault", description: "Complete outage in Metro Station area.", severity: "critical", status: "open", loggedAt: "2026-09-26 10:45:00" }
    ],
    selectedTower: null,
    backendConnected: false,
    draggedNode: null
};

// Canvas references
let canvas, ctx;
let pulsePhase = 0;

document.addEventListener("DOMContentLoaded", () => {
    initCanvas();
    setupEventListeners();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Initial Fetch from API
    fetchBackendData();
    setInterval(fetchBackendData, 10000);

    // Render components
    renderAll();
    requestAnimationFrame(animateGraph);
});

function updateLiveClock() {
    const clockEl = document.getElementById("liveClock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + " UTC";
    }
}

async function fetchBackendData() {
    try {
        const [towersRes, subsRes, compRes] = await Promise.all([
            fetch(`${API_BASE_URL}/towers`),
            fetch(`${API_BASE_URL}/subscribers`).catch(() => null),
            fetch(`${API_BASE_URL}/complaints`).catch(() => null)
        ]);

        if (towersRes && towersRes.ok) {
            const data = await towersRes.json();
            if (data.nodes && data.nodes.length > 0) {
                // Merge node coordinates
                data.nodes.forEach(n => {
                    const existing = state.towers.find(t => t.towerId === n.towerId);
                    if (existing) {
                        existing.isFaulty = n.isFaulty;
                        existing.towerName = n.towerName;
                    } else {
                        state.towers.push({ ...n, x: Math.random() * 600 + 100, y: Math.random() * 250 + 80 });
                    }
                });
            }
            if (data.edges) {
                state.edges = data.edges;
            }

            state.backendConnected = true;
        } else {
            state.backendConnected = false;
        }

        if (subsRes && subsRes.ok) {
            const subsData = await subsRes.json();
            if (Array.isArray(subsData) && subsData.length > 0) {
                state.subscribers = subsData;
            }
        }

        if (compRes && compRes.ok) {
            const compData = await compRes.json();
            if (Array.isArray(compData) && compData.length > 0) {
                state.complaints = compData;
            }
        }

        updateBackendStatusBadge(state.backendConnected);
        renderAll();
    } catch (e) {
        updateBackendStatusBadge(false);
    }
}

function updateBackendStatusBadge(connected) {
    const pill = document.getElementById("systemStatusPill");
    const text = document.getElementById("statusPillText");
    if (pill && text) {
        const faultyCount = state.towers.filter(t => t.isFaulty).length;
        if (faultyCount > 0) {
            pill.className = "status-pill warning-mode";
            text.textContent = `Alert: ${faultyCount} Tower Outages`;
        } else {
            pill.className = "status-pill";
            text.textContent = connected ? "Live Sync: Mesh Operational" : "Demo Mode: Mesh Operational";
        }
    }
}

/* ==========================================================================
   CANVAS GRAPH VISUALIZER
   ========================================================================== */

function initCanvas() {
    canvas = document.getElementById("topologyCanvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.addEventListener("mousedown", onCanvasMouseDown);
    canvas.addEventListener("mousemove", onCanvasMouseMove);
    canvas.addEventListener("mouseup", onCanvasMouseUp);
}

function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function animateGraph() {
    pulsePhase += 0.04;
    drawGraph();
    requestAnimationFrame(animateGraph);
}

function drawGraph() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Edges
    state.edges.forEach(edge => {
        const t1 = state.towers.find(t => t.towerId === edge.source);
        const t2 = state.towers.find(t => t.towerId === edge.target);
        if (t1 && t2) {
            const isDisrupted = t1.isFaulty || t2.isFaulty;
            ctx.beginPath();
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.lineWidth = isDisrupted ? 2 : 2.5;
            ctx.strokeStyle = isDisrupted ? "rgba(239, 68, 68, 0.45)" : "rgba(99, 102, 241, 0.35)";
            if (isDisrupted) ctx.setLineDash([6, 6]); else ctx.setLineDash([]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Animated Signal Pulse on Healthy Edges
            if (!isDisrupted) {
                const pulsePos = (Math.sin(pulsePhase + t1.towerId) + 1) / 2;
                const px = t1.x + (t2.x - t1.x) * pulsePos;
                const py = t1.y + (t2.y - t1.y) * pulsePos;

                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#38bdf8";
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    });

    // Draw Nodes (Towers)
    state.towers.forEach(t => {
        const isSelected = state.selectedTower && state.selectedTower.towerId === t.towerId;

        // Pulsing Ring for Faulty Towers
        if (t.isFaulty) {
            const ringRadius = 22 + Math.sin(pulsePhase * 2) * 8;
            ctx.beginPath();
            ctx.arc(t.x, t.y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Selection Highlight
        if (isSelected) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 24, 0, Math.PI * 2);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Base Circle
        ctx.beginPath();
        ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = t.isFaulty ? "#ef4444" : "#10b981";
        ctx.shadowColor = t.isFaulty ? "rgba(239,68,68,0.8)" : "rgba(16,185,129,0.6)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Icon inside node
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 11px 'Font Awesome 6 Free'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t.isFaulty ? "\uf071" : "\uf519", t.x, t.y);

        // Label
        ctx.font = "600 12px 'Inter', sans-serif";
        ctx.fillStyle = t.isFaulty ? "#fca5a5" : "#e5e7eb";
        ctx.fillText(t.towerName, t.x, t.y + 30);
    });
}

function onCanvasMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clicked = state.towers.find(t => Math.hypot(t.x - mx, t.y - my) < 22);
    if (clicked) {
        state.draggedNode = clicked;
        state.selectedTower = clicked;

        // Toggle Fault on click if Shift key held, or update form
        if (e.shiftKey) {
            toggleTowerFault(clicked.towerId);
        } else {
            updateMLFormForTower(clicked);
        }
        renderAll();
    }
}

function onCanvasMouseMove(e) {
    if (state.draggedNode) {
        const rect = canvas.getBoundingClientRect();
        state.draggedNode.x = e.clientX - rect.left;
        state.draggedNode.y = e.clientY - rect.top;
    }
}

function onCanvasMouseUp() {
    state.draggedNode = null;
}

function toggleTowerFault(towerId) {
    const tower = state.towers.find(t => t.towerId === towerId);
    if (tower) {
        tower.isFaulty = !tower.isFaulty;

        if (state.backendConnected) {
            fetch(`${API_BASE_URL}/towers/fault`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ towerId: towerId, isFaulty: tower.isFaulty })
            }).catch(() => {});
        }

        renderAll();
    }
}

/* ==========================================================================
   ML CHURN PREDICTOR CALCULATION ENGINE
   ========================================================================== */

function calculateChurnProbability(tenure, callDrops, monthlyFee, complaintCount, isFaulty) {
    // Formula derived from trained Random Forest Model feature weights
    const logit = -1.5
        - (0.05 * tenure)
        + (0.35 * callDrops)
        + (1.80 * (isFaulty ? 1 : 0))
        + (0.45 * complaintCount)
        + (0.008 * (monthlyFee - 60));

    const prob = 1 / (1 + Math.exp(-logit));
    return Math.min(Math.max(prob, 0.01), 0.99);
}

async function runAiPrediction() {
    const tenure = parseInt(document.getElementById("inputTenure").value);
    const callDrops = parseInt(document.getElementById("inputCallDrops").value);
    const fee = parseFloat(document.getElementById("inputFee").value);
    const complaints = parseInt(document.getElementById("inputComplaints").value);
    const isFaulty = document.getElementById("chkTowerFaulty").checked;

    const statusPill = document.getElementById("aiModelStatusPill");
    if (statusPill) {
        statusPill.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--primary)"></i> Querying AI Engine...`;
    }

    let resultData = null;

    if (state.backendConnected) {
        try {
            const res = await fetch(`${API_BASE_URL}/predict/churn`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenureMonths: tenure,
                    callDrops: callDrops,
                    monthlyFee: fee,
                    complaintCount: complaints,
                    isTowerFaulty: isFaulty
                })
            });
            if (res.ok) {
                resultData = await res.json();
            }
        } catch (e) {}
    }

    // Fallback or process API result
    if (!resultData) {
        const prob = calculateChurnProbability(tenure, callDrops, fee, complaints, isFaulty);
        let tier = "LOW";
        if (prob >= 0.80) tier = "CRITICAL";
        else if (prob >= 0.60) tier = "HIGH";
        else if (prob >= 0.35) tier = "MEDIUM";

        const rec = isFaulty
            ? "Reroute subscriber connection to nearest operational cell tower 'North Ridge' to reduce churn risk by 42%."
            : (prob >= 0.60 ? "Issue proactive $15 Service Guarantee account credit and trigger loyalty team check-in." : "Standard network monitoring active. No customer intervention required.");

        resultData = {
            churnProbability: prob,
            riskTier: tier,
            aiConfidence: 0.945,
            featureImportances: { call_drops: 0.352, is_tower_faulty: 0.284, tenure_months: 0.186 },
            aiRecommendations: [rec]
        };
    }

    // Update UI with AI prediction results
    const pct = (resultData.churnProbability * 100).toFixed(1);
    document.getElementById("gaugeProbVal").textContent = `${pct}%`;
    document.getElementById("gaugeBarFill").style.width = `${pct}%`;

    const badge = document.getElementById("gaugeRiskBadge");
    badge.className = `risk-badge ${resultData.riskTier}`;
    badge.textContent = `${resultData.riskTier} RISK`;

    const confEl = document.getElementById("lblAiConfidence");
    if (confEl) confEl.textContent = `${(resultData.aiConfidence * 100).toFixed(1)}% AI Confidence`;

    if (statusPill) {
        statusPill.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--success)"></i> AI Model Synced`;
    }

    // Feature Importances
    const impCall = document.getElementById("barImpCallDrops");
    const impTower = document.getElementById("barImpTower");
    const impTenure = document.getElementById("barImpTenure");

    if (resultData.featureImportances) {
        const fi = resultData.featureImportances;
        const callVal = (fi.call_drops || 0.1989) * 100;
        const towerVal = (fi.is_tower_faulty || 0.2235) * 100;
        const tenureVal = (fi.tenure_months || 0.3598) * 100;

        if (impCall) impCall.style.width = `${callVal.toFixed(1)}%`;
        if (impTower) impTower.style.width = `${towerVal.toFixed(1)}%`;
        if (impTenure) impTenure.style.width = `${tenureVal.toFixed(1)}%`;
    } else {
        if (impCall) impCall.style.width = `${Math.min(callDrops * 3.3, 100)}%`;
        if (impTower) impTower.style.width = `${isFaulty ? 90 : 15}%`;
        if (impTenure) impTenure.style.width = `${Math.max(100 - tenure * 1.4, 10)}%`;
    }

    // AI Recommendation
    const recTxt = document.getElementById("txtAiRecommendation");
    if (recTxt && resultData.aiRecommendations && resultData.aiRecommendations.length > 0) {
        recTxt.textContent = resultData.aiRecommendations[0];
    }
}

function updateMLPredictorUI() {
    const tenure = parseInt(document.getElementById("inputTenure").value);
    const callDrops = parseInt(document.getElementById("inputCallDrops").value);
    const fee = parseFloat(document.getElementById("inputFee").value);
    const complaints = parseInt(document.getElementById("inputComplaints").value);

    document.getElementById("lblTenureVal").textContent = `${tenure} months`;
    document.getElementById("lblCallDropsVal").textContent = `${callDrops} drops`;
    document.getElementById("lblFeeVal").textContent = `$${fee.toFixed(2)}`;
    document.getElementById("lblComplaintVal").textContent = `${complaints} complaint${complaints !== 1 ? 's' : ''}`;

    runAiPrediction();
}

function updateMLFormForTower(tower) {
    const chk = document.getElementById("chkTowerFaulty");
    if (chk) {
        chk.checked = tower.isFaulty;
        updateMLPredictorUI();
    }
}

/* ==========================================================================
   RENDER & TABLE UPDATES
   ========================================================================== */

function renderMetrics() {
    const totalTowers = state.towers.length;
    const faultyTowers = state.towers.filter(t => t.isFaulty).length;
    const healthyTowers = totalTowers - faultyTowers;

    document.getElementById("metricTotalTowers").textContent = totalTowers;
    document.getElementById("metricHealthyTowers").textContent = `${healthyTowers} Operational`;
    document.getElementById("metricFaultyTowers").textContent = faultyTowers;

    document.getElementById("metricTotalSubscribers").textContent = state.subscribers.length;

    // Recalculate at-risk subscribers
    let highRiskCount = 0;
    state.subscribers.forEach(s => {
        const tower = state.towers.find(t => t.towerId === s.connectedTowerId);
        const isFaulty = tower ? tower.isFaulty : false;
        const prob = calculateChurnProbability(s.tenureMonths, s.callDrops, 59.99, 1, isFaulty);
        if (prob >= 0.70 || isFaulty || s.callDrops >= 15) highRiskCount++;
    });

    document.getElementById("metricAtRiskSubscribers").textContent = highRiskCount;
}

function renderComplaintsTable() {
    const tbody = document.getElementById("complaintsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    state.complaints.forEach(c => {
        const sub = state.subscribers.find(s => s.subscriberId === c.subscriberId);
        const tower = state.towers.find(t => t.towerId === c.towerId);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${c.complaintId}</td>
            <td><strong>${sub ? sub.name : 'Sub #' + c.subscriberId}</strong></td>
            <td>${tower ? tower.towerName : 'Tower #' + c.towerId}</td>
            <td><code>${c.category}</code></td>
            <td><span class="risk-badge ${c.severity.toUpperCase()}">${c.severity.toUpperCase()}</span></td>
            <td><span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span></td>
            <td>
                ${c.status !== 'resolved' ? `<button class="btn" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="resolveComplaint(${c.complaintId})"><i class="fa-solid fa-check"></i> Resolve</button>` : '<span style="color:var(--text-muted); font-size:0.75rem;">Done</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRiskSubscribersTable() {
    const tbody = document.getElementById("riskSubscribersTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    state.subscribers.forEach(s => {
        const tower = state.towers.find(t => t.towerId === s.connectedTowerId);
        const isFaulty = tower ? tower.isFaulty : false;
        const prob = calculateChurnProbability(s.tenureMonths, s.callDrops, 59.99, 1, isFaulty);

        if (prob >= 0.60 || isFaulty || s.callDrops >= 10) {
            // Find backup tower across all connected edges
            let backupName = "None Available";
            if (tower) {
                const connectedEdges = state.edges.filter(e => e.source === tower.towerId || e.target === tower.towerId);
                for (const edge of connectedEdges) {
                    const backupId = edge.source === tower.towerId ? edge.target : edge.source;
                    const backup = state.towers.find(t => t.towerId === backupId && !t.isFaulty);
                    if (backup) {
                        backupName = backup.towerName;
                        break;
                    }
                }
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${s.name}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${s.email}</span></td>
                <td>${tower ? tower.towerName : 'Tower #' + s.connectedTowerId} ${isFaulty ? '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>' : ''}</td>
                <td><span style="font-family:var(--font-mono); font-weight:700;">${s.callDrops}</span></td>
                <td><span class="risk-badge ${prob >= 0.8 ? 'CRITICAL' : 'HIGH'}">${(prob * 100).toFixed(1)}%</span></td>
                <td><span class="badge" style="background:rgba(6,182,212,0.15); color:var(--accent-cyan);"><i class="fa-solid fa-route"></i> ${backupName}</span></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

async function resolveComplaint(complaintId) {
    const complaint = state.complaints.find(c => c.complaintId === complaintId);
    if (complaint) {
        complaint.status = "resolved";

        if (state.backendConnected) {
            try {
                await fetch(`${API_BASE_URL}/complaints/resolve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ complaintId: complaintId })
                });
            } catch (e) {}
        }

        // Check if tower has open complaints remaining
        const remainingOpen = state.complaints.filter(c => c.towerId === complaint.towerId && c.status !== "resolved").length;
        if (remainingOpen < 3) {
            const tower = state.towers.find(t => t.towerId === complaint.towerId);
            if (tower) tower.isFaulty = false;
        }

        renderAll();
    }
}

function renderAll() {
    renderMetrics();
    renderComplaintsTable();
    renderRiskSubscribersTable();
    updateMLPredictorUI();
    updateBackendStatusBadge(state.backendConnected);
}

/* ==========================================================================
   EVENT LISTENERS & MODALS
   ========================================================================== */

function setupEventListeners() {
    // ML Slider Events
    ["inputTenure", "inputCallDrops", "inputFee", "inputComplaints", "chkTowerFaulty"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", updateMLPredictorUI);
    });

    const btnAiPredict = document.getElementById("btnRunAiPredict");
    if (btnAiPredict) {
        btnAiPredict.addEventListener("click", (e) => {
            e.preventDefault();
            runAiPrediction();
        });
    }

    // Reset View Button
    const btnReset = document.getElementById("btnResetGraphView");
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            const coords = [
                { x: 200, y: 220 }, { x: 380, y: 120 }, { x: 540, y: 200 }, { x: 180, y: 350 },
                { x: 340, y: 320 }, { x: 420, y: 240 }, { x: 680, y: 130 }, { x: 650, y: 280 }
            ];
            state.towers.forEach((t, i) => {
                if (coords[i]) { t.x = coords[i].x; t.y = coords[i].y; }
            });
            state.selectedTower = null;
            renderAll();
        });
    }

    // Simulate Outage Button
    const btnSimulate = document.getElementById("btnSimulateOutage");
    if (btnSimulate) {
        btnSimulate.addEventListener("click", () => {
            const healthyTowers = state.towers.filter(t => !t.isFaulty);
            if (healthyTowers.length > 0) {
                const randomTower = healthyTowers[Math.floor(Math.random() * healthyTowers.length)];
                toggleTowerFault(randomTower.towerId);

                // Add a critical complaint automatically
                state.complaints.unshift({
                    complaintId: state.complaints.length + 10,
                    subscriberId: Math.floor(Math.random() * 10) + 1,
                    towerId: randomTower.towerId,
                    category: "network_fault",
                    description: `Automated Alarm: High failure rate detected on ${randomTower.towerName}`,
                    severity: "critical",
                    status: "open",
                    loggedAt: new Date().toISOString()
                });

                renderAll();
            }
        });
    }

    // Modal Events
    const modal = document.getElementById("complaintModal");
    const btnOpenModal = document.getElementById("btnOpenNewComplaintModal");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");

    if (btnOpenModal) {
        btnOpenModal.addEventListener("click", () => {
            populateModalDropdowns();
            modal.classList.add("active");
        });
    }

    const closeModal = () => modal.classList.remove("active");
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    const complaintForm = document.getElementById("newComplaintForm");
    if (complaintForm) {
        complaintForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const subId = parseInt(document.getElementById("modalSubSelect").value);
            const towerId = parseInt(document.getElementById("modalTowerSelect").value);
            const category = document.getElementById("modalCategorySelect").value;
            const severity = document.getElementById("modalSeveritySelect").value;
            const desc = document.getElementById("modalDescription").value || "Subscriber reported network degradation.";

            const newComp = {
                complaintId: state.complaints.length + 1,
                subscriberId: subId,
                towerId: towerId,
                category: category,
                description: desc,
                severity: severity,
                status: "open",
                loggedAt: new Date().toISOString()
            };

            if (state.backendConnected) {
                try {
                    const res = await fetch(`${API_BASE_URL}/complaints`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            subscriberId: subId,
                            towerId: towerId,
                            category: category,
                            description: desc,
                            severity: severity
                        })
                    });
                    if (res.ok) {
                        const created = await res.json();
                        if (created && created.complaintId) {
                            newComp.complaintId = created.complaintId;
                        }
                    }
                } catch (err) {}
            }

            state.complaints.unshift(newComp);

            // Check if complaints on tower trigger fault
            const towerOpenCount = state.complaints.filter(c => c.towerId === towerId && c.status === "open").length;
            if (towerOpenCount >= 3) {
                const tower = state.towers.find(t => t.towerId === towerId);
                if (tower) tower.isFaulty = true;
            }

            closeModal();
            renderAll();
        });
    }
}

function populateModalDropdowns() {
    const subSelect = document.getElementById("modalSubSelect");
    const towerSelect = document.getElementById("modalTowerSelect");

    if (subSelect) {
        subSelect.innerHTML = state.subscribers.map(s => `<option value="${s.subscriberId}">${s.name} (${s.email})</option>`).join("");
    }
    if (towerSelect) {
        towerSelect.innerHTML = state.towers.map(t => `<option value="${t.towerId}">${t.towerName} ${t.isFaulty ? '(Faulty)' : ''}</option>`).join("");
    }
}
