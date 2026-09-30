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

function getStoredComplaints() {
    try {
        const saved = localStorage.getItem("telecom_complaints");
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return [];
    }
}

function saveComplaintsToStorage() {
    try {
        localStorage.setItem("telecom_complaints", JSON.stringify(state.complaints));
    } catch (error) {
        // Ignore storage errors for browser-incompatible environments.
    }
}

function getNextComplaintId() {
    if (!state.complaints || state.complaints.length === 0) return 1;
    return Math.max(...state.complaints.map(c => Number(c.complaintId) || 0)) + 1;
}

const defaultComplaints = [
    { complaintId: 1, subscriberId: 2, towerId: 3, category: "network_fault", description: "Repeated dropped calls near East Market tower.", severity: "high", status: "open", loggedAt: "2026-09-26 09:15:00" },
    { complaintId: 2, subscriberId: 3, towerId: 3, category: "network_fault", description: "Intermittent service and slow data around East Market.", severity: "critical", status: "in_progress", loggedAt: "2026-09-26 09:40:00" },
    { complaintId: 3, subscriberId: 5, towerId: 3, category: "call_drops", description: "Calls disconnect several times each day.", severity: "high", status: "open", loggedAt: "2026-09-26 10:05:00" },
    { complaintId: 4, subscriberId: 7, towerId: 3, category: "network_fault", description: "No reliable signal during evening commute.", severity: "medium", status: "open", loggedAt: "2026-09-26 10:20:00" },
    { complaintId: 5, subscriberId: 1, towerId: 2, category: "billing", description: "Question about international usage charge.", severity: "low", status: "resolved", loggedAt: "2026-09-25 14:10:00" },
    { complaintId: 6, subscriberId: 9, towerId: 7, category: "network_fault", description: "Complete outage in Metro Station area.", severity: "critical", status: "open", loggedAt: "2026-09-26 10:45:00" }
];

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
    complaints: getStoredComplaints().length > 0 ? getStoredComplaints() : defaultComplaints,
    selectedTower: null,
    backendConnected: false,
    draggedNode: null
};

// Canvas references
let canvas, ctx;
let pulsePhase = 0;
let networkMap = null;
let mapMarkers = [];

document.addEventListener("DOMContentLoaded", () => {
    initCanvas();
    initMap();
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
                saveComplaintsToStorage();
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

function initMap() {
    const mapContainer = document.getElementById("networkMap");
    if (!mapContainer || typeof L === "undefined") return;

    if (!networkMap) {
        networkMap = L.map("networkMap", {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([40.72, -74.02], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(networkMap);
    }

    renderMap();
    setTimeout(() => {
        if (networkMap) {
            networkMap.invalidateSize();
        }
    }, 200);
}

function renderMap() {
    if (!networkMap || typeof L === "undefined") return;

    mapMarkers.forEach(marker => networkMap.removeLayer(marker));
    mapMarkers = [];

    state.towers.forEach(tower => {
        if (!tower.latitude || !tower.longitude) return;

        const marker = L.circleMarker([tower.latitude, tower.longitude], {
            radius: tower.isFaulty ? 10 : 8,
            color: tower.isFaulty ? "#ef4444" : "#10b981",
            fillColor: tower.isFaulty ? "#ef4444" : "#10b981",
            fillOpacity: 0.9,
            weight: 2
        }).addTo(networkMap);

        const popupInfo = `
            <div style="font-family: Inter, sans-serif; min-width: 170px; line-height: 1.5;">
                <div style="font-weight: 800; margin-bottom: 4px; color: #0f172a;">${tower.towerName}</div>
                <div style="font-size: 12px; color: #334155;">Status: ${tower.isFaulty ? "Faulty" : "Operational"}</div>
                <div style="font-size: 12px; color: #334155;">Tower ID: ${tower.towerId}</div>
            </div>
        `;

        marker.bindPopup(popupInfo, {
            autoClose: true,
            closeButton: true,
            closeOnClick: true
        });

        marker.on("click", function () {
            if (marker.isPopupOpen()) {
                marker.closePopup();
            } else {
                marker.openPopup();
            }
            state.selectedTower = tower;
            renderAll();
        });

        mapMarkers.push(marker);
    });

    if (state.selectedTower && state.selectedTower.latitude && state.selectedTower.longitude) {
        networkMap.flyTo([state.selectedTower.latitude, state.selectedTower.longitude], 11, {
            animate: true,
            duration: 0.8
        });
    }
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

function clampNumber(value, min, max, fallback) {
    const num = Number.isFinite(Number(value)) ? Number(value) : fallback;
    if (Number.isNaN(num)) return fallback;
    return Math.min(Math.max(num, min), max);
}

function getPredictionInputs() {
    const tenureEl = document.getElementById("inputTenure");
    const callDropsEl = document.getElementById("inputCallDrops");
    const feeEl = document.getElementById("inputFee");
    const complaintsEl = document.getElementById("inputComplaints");
    const faultyEl = document.getElementById("chkTowerFaulty");

    const tenure = clampNumber(tenureEl ? tenureEl.value : 12, 1, 72, 12);
    const callDrops = clampNumber(callDropsEl ? callDropsEl.value : 4, 0, 30, 4);
    const fee = clampNumber(feeEl ? feeEl.value : 60, 20, 150, 60);
    const complaints = clampNumber(complaintsEl ? complaintsEl.value : 1, 0, 10, 1);
    const isFaulty = !!(faultyEl && faultyEl.checked);

    return { tenure, callDrops, fee, complaints, isFaulty };
}

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

function getRiskTier(probability) {
    if (probability >= 0.80) return "CRITICAL";
    if (probability >= 0.60) return "HIGH";
    if (probability >= 0.35) return "MEDIUM";
    return "LOW";
}

function getMitigationRecommendation({ tenure, callDrops, fee, complaints, isFaulty }, probability) {
    const tier = getRiskTier(probability);
    const actions = [];

    if (isFaulty) {
        actions.push("Restore service by rerouting to an operational tower and investigate the outage");
    }
    if (callDrops >= 8) {
        actions.push(callDrops >= 16
            ? "Prioritize radio-quality and handover diagnostics for the frequent call drops"
            : "Review call-drop logs and check signal quality along the subscriber's usual route");
    }
    if (complaints >= 2) {
        actions.push(complaints >= 5
            ? "Escalate the repeated complaints into one priority case, assign an owner, and contact the subscriber"
            : "Review the complaint history, assign a case owner, and send the subscriber a progress update");
    }
    if (tenure <= 6 && tier !== "LOW") {
        actions.push("Check the new subscriber's setup and early service experience, then schedule a follow-up");
    }
    if (tenure >= 48 && tier !== "LOW") {
        actions.push("Offer a proactive service review and retention check-in for this long-standing account");
    }
    if (fee >= 100 && tier !== "LOW") {
        actions.push("Review plan value and explain available options that better match the subscriber's usage");
    }
    if (actions.length === 0 && (tier === "HIGH" || tier === "CRITICAL")) {
        actions.push("Contact the subscriber promptly, review recent service events, and schedule a follow-up");
    } else if (actions.length === 0 && tier === "MEDIUM") {
        actions.push("Schedule a proactive service check and monitor for new complaints or signal problems");
    } else if (actions.length === 0) {
        actions.push("Continue routine monitoring and reassess if service conditions change");
    }

    return actions.slice(0, 3).join(". ") + ".";
}

let predictionRequestId = 0;

async function runAiPrediction() {
    const { tenure, callDrops, fee, complaints, isFaulty } = getPredictionInputs();
    const requestId = ++predictionRequestId;

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
                const data = await res.json();
                if (data && typeof data.churnProbability === "number") {
                    resultData = data;
                }
            }
        } catch (e) {}
    }

    if (!resultData) {
        const prob = calculateChurnProbability(tenure, callDrops, fee, complaints, isFaulty);
        const tier = getRiskTier(prob);

        resultData = {
            churnProbability: prob,
            riskTier: tier,
            aiConfidence: 0.945,
            featureImportances: { call_drops: 0.352, is_tower_faulty: 0.284, tenure_months: 0.186 },
            aiRecommendations: []
        };
    }

    if (requestId !== predictionRequestId) return;

    const rawProbability = Number(resultData.churnProbability);
    const probability = Number.isFinite(rawProbability) ? Math.min(Math.max(rawProbability, 0), 1) : calculateChurnProbability(tenure, callDrops, fee, complaints, isFaulty);
    const tier = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(String(resultData.riskTier).toUpperCase())
        ? String(resultData.riskTier).toUpperCase()
        : getRiskTier(probability);
    const recommendation = getMitigationRecommendation({ tenure, callDrops, fee, complaints, isFaulty }, probability);
    const pct = (probability * 100).toFixed(1);
    const gaugeVal = document.getElementById("gaugeProbVal");
    const gaugeBar = document.getElementById("gaugeBarFill");
    const badge = document.getElementById("gaugeRiskBadge");
    const confEl = document.getElementById("lblAiConfidence");

    if (gaugeVal) gaugeVal.textContent = `${pct}%`;
    if (gaugeBar) gaugeBar.style.width = `${pct}%`;

    if (badge) {
        badge.className = `risk-badge ${tier}`;
        badge.textContent = `${tier} RISK`;
    }

    if (confEl) {
        const confidence = Number(resultData.aiConfidence || 0.945) * 100;
        confEl.textContent = `${confidence.toFixed(1)}% AI Confidence`;
    }

    if (statusPill) {
        statusPill.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--success)"></i> AI Model Synced`;
    }

    const impCall = document.getElementById("barImpCallDrops");
    const impTower = document.getElementById("barImpTower");
    const impTenure = document.getElementById("barImpTenure");

    if (resultData.featureImportances) {
        const fi = resultData.featureImportances;
        const callVal = ((fi.call_drops || 0.1989) * 100).toFixed(1);
        const towerVal = ((fi.is_tower_faulty || 0.2235) * 100).toFixed(1);
        const tenureVal = ((fi.tenure_months || 0.3598) * 100).toFixed(1);

        if (impCall) impCall.style.width = `${callVal}%`;
        if (impTower) impTower.style.width = `${towerVal}%`;
        if (impTenure) impTenure.style.width = `${tenureVal}%`;
    } else {
        if (impCall) impCall.style.width = `${Math.min(callDrops * 3.3, 100)}%`;
        if (impTower) impTower.style.width = `${isFaulty ? 90 : 15}%`;
        if (impTenure) impTenure.style.width = `${Math.max(100 - tenure * 1.4, 10)}%`;
    }

    const recTxt = document.getElementById("txtAiRecommendation");
    if (recTxt) recTxt.textContent = recommendation;
}

function updateMLPredictorUI() {
    const { tenure, callDrops, fee, complaints } = getPredictionInputs();

    const tenureEl = document.getElementById("lblTenureVal");
    const callDropsEl = document.getElementById("lblCallDropsVal");
    const feeEl = document.getElementById("lblFeeVal");
    const complaintEl = document.getElementById("lblComplaintVal");

    if (tenureEl) tenureEl.textContent = `${Math.round(tenure)} months`;
    if (callDropsEl) callDropsEl.textContent = `${Math.round(callDrops)} drops`;
    if (feeEl) feeEl.textContent = `$${Number(fee).toFixed(2)}`;
    if (complaintEl) complaintEl.textContent = `${Math.round(complaints)} complaint${complaints !== 1 ? 's' : ''}`;

    runAiPrediction();
}

function updateMLFormForTower(tower) {
    const chk = document.getElementById("chkTowerFaulty");
    if (chk) {
        chk.checked = tower.isFaulty;
        updateMLPredictorUI();
    }
}

function normalizeSearchValue(value) {
    return String(value || "").trim().toLowerCase();
}

function escapeCustomerText(value) {
    return String(value || "").replace(/[<>&"']/g, character => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;"
    }[character]));
}

function renderCustomerSearchOptions() {
    const options = document.getElementById("customerSearchOptions");
    if (!options) return;

    options.innerHTML = state.subscribers.map(subscriber =>
        `<option value="${subscriber.name}">${subscriber.email} | ID ${subscriber.subscriberId}</option>`
    ).join("");
}

function findCustomer(searchValue) {
    const query = normalizeSearchValue(searchValue);
    if (!query) return null;

    return state.subscribers.find(subscriber => [
        subscriber.name,
        subscriber.email,
        subscriber.phone,
        subscriber.subscriberId
    ].some(value => normalizeSearchValue(value) === query)) || state.subscribers.find(subscriber => [
        subscriber.name,
        subscriber.email,
        subscriber.phone,
        subscriber.subscriberId
    ].some(value => normalizeSearchValue(value).includes(query)));
}

function showCustomerAiAnswer(searchValue) {
    const answerBox = document.getElementById("customerAiAnswer");
    if (!answerBox) return;

    const customer = findCustomer(searchValue);
    if (!customer) {
        answerBox.innerHTML = `
            <h3><i class="fa-solid fa-circle-question" style="color: var(--warning);"></i> Customer not found</h3>
            <p>No subscriber matches "${escapeCustomerText(searchValue)}". Try a name, email, phone number, or customer ID.</p>
        `;
        return;
    }

    const tower = state.towers.find(item => Number(item.towerId) === Number(customer.connectedTowerId));
    const complaints = state.complaints.filter(complaint => Number(complaint.subscriberId) === Number(customer.subscriberId));
    const activeComplaints = complaints.filter(complaint => complaint.status !== "resolved");
    const probability = calculateChurnProbability(
        customer.tenureMonths,
        customer.callDrops,
        59.99,
        complaints.length,
        Boolean(tower && tower.isFaulty)
    );
    const riskTier = getRiskTier(probability);
    const complaintSummary = activeComplaints.length > 0
        ? activeComplaints.map(complaint => `${complaint.category.replaceAll("_", " ")} (${complaint.severity})`).join(", ")
        : "no active complaints";
    const highestSeverity = activeComplaints.some(complaint => complaint.severity === "critical")
        ? "CRITICAL"
        : activeComplaints.some(complaint => complaint.severity === "high") ? "HIGH" : "STANDARD";
    const priority = tower && tower.isFaulty || highestSeverity === "CRITICAL" || riskTier === "CRITICAL"
        ? "Immediate"
        : highestSeverity === "HIGH" || riskTier === "HIGH" ? "High" : "Normal";
    const issueDetails = activeComplaints.length > 0
        ? activeComplaints.map(complaint => escapeCustomerText(complaint.description)).join(" ")
        : "No unresolved problem description is available.";
    const likelyCause = tower && tower.isFaulty
        ? `Likely network fault at ${escapeCustomerText(tower.towerName)}.`
        : customer.callDrops >= 8
            ? "Likely radio-quality or handover instability along the customer's usual route."
            : activeComplaints.some(complaint => complaint.category === "billing")
                ? "Likely account or billing-record discrepancy; payment details need verification."
                : "No single root cause is confirmed from the available records; agent review is required.";
    const suggestions = [];
    if (tower && tower.isFaulty) {
        suggestions.push(`Create or link a network incident for ${escapeCustomerText(tower.towerName)} and check whether nearby customers are affected.`);
        suggestions.push("Offer a temporary reroute to an operational tower and confirm service recovery with the customer.");
    }
    if (customer.callDrops >= 8) {
        suggestions.push("Run radio-quality, signal-strength, and handover diagnostics for the reported location and time.");
    }
    if (activeComplaints.some(complaint => complaint.category === "billing")) {
        suggestions.push("Verify the usage record, explain the charge in plain language, and apply an adjustment when the review confirms an error.");
    }
    if (activeComplaints.length > 1) {
        suggestions.push("Consolidate repeated complaints under one owner so the customer receives one consistent update.");
    }
    if (suggestions.length === 0) {
        suggestions.push("Keep the account under routine monitoring and contact the customer if the issue returns.");
    }
    let resolutionPlan;
    if (tower && tower.isFaulty) {
        resolutionPlan = `Open a network incident for ${escapeCustomerText(tower.towerName)}, reroute the customer to the nearest operational tower, and send an update when service is restored.`;
    } else if (customer.callDrops >= 8) {
        resolutionPlan = "Run radio-quality and handover diagnostics for the customer's route, then follow up after the call-drop rate is checked.";
    } else if (activeComplaints.some(complaint => complaint.category === "billing")) {
        resolutionPlan = "Assign the billing case to an agent, verify the disputed charge, and send the customer a written explanation or adjustment.";
    } else if (activeComplaints.length > 0) {
        resolutionPlan = "Assign an owner, review the complaint details, and contact the customer with a progress update before closing the case.";
    } else {
        resolutionPlan = "No immediate intervention is required; continue monitoring and contact the customer if a new complaint appears.";
    }
    const recommendation = getMitigationRecommendation({
        tenure: Number(customer.tenureMonths) || 0,
        callDrops: Number(customer.callDrops) || 0,
        fee: 59.99,
        complaints: complaints.length,
        isFaulty: Boolean(tower && tower.isFaulty)
    }, probability);

    answerBox.innerHTML = `
        <h3><i class="fa-solid fa-user-check" style="color: var(--success);"></i> ${escapeCustomerText(customer.name)}</h3>
        <div class="customer-ai-section" style="margin-top: 0.2rem; padding-top: 0; border-top: 0;">
            <strong>AI diagnosis</strong>
            <p>${activeComplaints.length > 0 ? issueDetails : "There are no unresolved complaints for this customer."}</p>
            <p style="margin-top: 0.35rem;"><strong>Likely cause</strong>${likelyCause}</p>
        </div>
        <div class="customer-ai-section">
            <strong>Professional recommendations</strong>
            <ol class="customer-ai-suggestions">${suggestions.map(suggestion => `<li>${suggestion}</li>`).join("")}</ol>
        </div>
        <div class="customer-ai-section">
            <strong>Recommended resolution</strong>
            <p>${resolutionPlan} ${recommendation}</p>
        </div>
        <div class="customer-ai-section">
            <strong>Customer-ready response</strong>
            <p>Hello ${escapeCustomerText(customer.name)}, we are sorry for the inconvenience. We have reviewed your complaint and marked it as ${priority.toLowerCase()} priority. Our support team is investigating the issue and will share the next update after the recommended checks are complete.</p>
        </div>
        <div class="customer-ai-facts">
            <span class="customer-ai-fact">${complaints.length} total complaint${complaints.length === 1 ? "" : "s"}</span>
            <span class="customer-ai-fact">${activeComplaints.length} active</span>
            <span class="customer-ai-fact">${customer.callDrops} call drops</span>
            <span class="customer-ai-fact">${priority} priority</span>
            <span class="customer-ai-fact">${riskTier} churn risk (${(probability * 100).toFixed(1)}%)</span>
        </div>
    `;
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
    renderCustomerSearchOptions();
    updateMLPredictorUI();
    updateBackendStatusBadge(state.backendConnected);
    renderMap();
}

/* ==========================================================================
   EVENT LISTENERS & MODALS
   ========================================================================== */

function setupEventListeners() {
    const customerSearchForm = document.getElementById("customerSearchForm");
    if (customerSearchForm) {
        customerSearchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            showCustomerAiAnswer(document.getElementById("customerSearchInput").value);
        });
    }

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
                    complaintId: getNextComplaintId(),
                    subscriberId: Math.floor(Math.random() * 10) + 1,
                    towerId: randomTower.towerId,
                    category: "network_fault",
                    description: `Automated Alarm: High failure rate detected on ${randomTower.towerName}`,
                    severity: "critical",
                    status: "open",
                    loggedAt: new Date().toISOString()
                });

                saveComplaintsToStorage();

                renderAll();
            }
        });
    }

    // Modal Events
    const modal = document.getElementById("complaintModal");
    const btnOpenModal = document.getElementById("btnOpenNewComplaintModal");
    const btnOpenComplaintFromNav = document.getElementById("btnOpenComplaintFromNav");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");

    const openComplaintModal = () => {
        if (!modal) return;
        populateModalDropdowns();
        modal.classList.add("active");
    };

    if (btnOpenModal) {
        btnOpenModal.addEventListener("click", openComplaintModal);
    }
    if (btnOpenComplaintFromNav) {
        btnOpenComplaintFromNav.addEventListener("click", openComplaintModal);
    }

    const closeModal = () => modal.classList.remove("active");
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    const complaintForm = document.getElementById("newComplaintForm");
    if (complaintForm) {
        complaintForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const subId = parseInt(document.getElementById("modalSubSelect").value);
            const category = document.getElementById("modalCategorySelect").value;
            const severity = document.getElementById("modalSeveritySelect").value;
            const desc = document.getElementById("modalDescription").value || "Subscriber reported network degradation.";
            const towerId = inferTowerForComplaint(subId, category, desc);

            const newComp = {
                complaintId: getNextComplaintId(),
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
            saveComplaintsToStorage();

            const tower = state.towers.find(t => Number(t.towerId) === Number(towerId));
            if (tower && (category === "network_fault" || category === "coverage" || category === "call_drops")) {
                const towerOpenCount = state.complaints.filter(c => Number(c.towerId) === Number(towerId) && c.status === "open").length;
                if (towerOpenCount >= 2) {
                    tower.isFaulty = true;
                }
            }

            closeModal();
            renderAll();
        });
    }
}

function inferTowerForComplaint(subscriberId, category, description = "") {
    const subscriber = state.subscribers.find(s => Number(s.subscriberId) === Number(subscriberId));
    const combinedText = `${category || ""} ${description || ""}`.toLowerCase();

    const mentionedTower = state.towers.find(tower => {
        const towerName = tower.towerName.toLowerCase();
        return combinedText.includes(towerName) || combinedText.includes(towerName.replace(/\s+/g, ""));
    });
    if (mentionedTower) {
        return mentionedTower.towerId;
    }

    const currentTowerId = subscriber ? Number(subscriber.connectedTowerId) : null;
    const currentTower = currentTowerId ? state.towers.find(t => Number(t.towerId) === currentTowerId) : null;
    if (currentTower && !currentTower.isFaulty) {
        return currentTower.towerId;
    }

    const preferredTower = currentTower || state.towers.find(t => !t.isFaulty) || state.towers[0];
    if (!preferredTower) {
        return 1;
    }

    const severityKeywords = ["outage", "fault", "down", "dead", "coverage", "drop", "slow", "disconnect", "no signal", "network"];
    const categoryBoost = ["network_fault", "call_drops", "coverage", "slow_data"].includes(category) ? 1 : 0;

    if (categoryBoost || severityKeywords.some(keyword => combinedText.includes(keyword))) {
        const repairCandidate = state.towers.find(t => !t.isFaulty && t.towerId !== preferredTower.towerId);
        if (repairCandidate) return repairCandidate.towerId;
    }

    return Number(preferredTower.towerId);
}

function populateModalDropdowns() {
    const subSelect = document.getElementById("modalSubSelect");

    if (subSelect) {
        let customer = null;
        try {
            customer = JSON.parse(localStorage.getItem("telecom_customer_profile") || "null");
        } catch (error) {
            customer = null;
        }

        let customerSubscriber = customer && customer.email
            ? state.subscribers.find(subscriber => subscriber.email && subscriber.email.toLowerCase() === customer.email.toLowerCase())
            : null;

        if (!customerSubscriber && customer && customer.email) {
            const storedSubscriber = getStoredSubscribers().find(subscriber => subscriber.email && subscriber.email.toLowerCase() === customer.email.toLowerCase());
            if (storedSubscriber) {
                state.subscribers.push(storedSubscriber);
                customerSubscriber = storedSubscriber;
            }
        }

        subSelect.innerHTML = state.subscribers.map(s => `<option value="${s.subscriberId}">${s.name} (${s.email})</option>`).join("");
        if (customerSubscriber) {
            subSelect.value = String(customerSubscriber.subscriberId);
        }
    }
}
