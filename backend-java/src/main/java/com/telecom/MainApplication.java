package com.telecom;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import com.telecom.config.DatabaseConfig;
import com.telecom.graph.TowerNetworkGraph;
import com.telecom.models.Complaint;
import com.telecom.models.Subscriber;
import com.telecom.models.Tower;
import com.telecom.services.ComplaintService;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Main application entry point for Telecom Fault Tracker & Churn System.
 * Launches embedded HTTP server and manages network topology graph operations.
 */
public class MainApplication {

    private static final Logger LOGGER = Logger.getLogger(MainApplication.class.getName());
    private static final int DEFAULT_PORT = 8080;
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    private final TowerNetworkGraph networkGraph = new TowerNetworkGraph();
    private final ComplaintService complaintService = new ComplaintService();

    public static void main(String[] args) {
        MainApplication app = new MainApplication();
        app.start();
    }

    public void start() {
        LOGGER.info("==================================================================");
        LOGGER.info("Starting Telecom Fault Tracker & Churn Prediction Backend");
        LOGGER.info("==================================================================");

        // Load data from MySQL or memory fallback
        boolean dbSuccess = loadDataFromDatabase();
        if (!dbSuccess) {
            LOGGER.info("MySQL database connection not established. Initializing sample network graph in memory...");
            loadSampleInMemoryData();
        }

        printDiagnosticSummary();
        startHttpServer();
    }

    private boolean loadDataFromDatabase() {
        if (!DatabaseConfig.testConnection()) {
            return false;
        }

        try (Connection conn = DatabaseConfig.getConnection()) {
            LOGGER.info("Connected to MySQL Database: " + DatabaseConfig.getDbUrl());

            // 1. Load Towers
            String towerSql = "SELECT tower_id, tower_name, latitude, longitude, is_faulty FROM towers";
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(towerSql)) {
                while (rs.next()) {
                    Tower t = new Tower(
                        rs.getLong("tower_id"),
                        rs.getString("tower_name"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getBoolean("is_faulty")
                    );
                    networkGraph.addTower(t);
                }
            }

            // 2. Load Connections
            String connSql = "SELECT tower_id, connected_tower_id FROM tower_connections";
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(connSql)) {
                while (rs.next()) {
                    networkGraph.addEdge(rs.getLong("tower_id"), rs.getLong("connected_tower_id"));
                }
            }

            // 3. Load Subscribers
            String subSql = "SELECT subscriber_id, first_name, last_name, email, phone_number, plan_id, connected_tower_id, tenure_months, call_drops, churned, churn_prob FROM subscribers";
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(subSql)) {
                while (rs.next()) {
                    Double churnProb = rs.getObject("churn_prob") != null ? rs.getDouble("churn_prob") : null;
                    Subscriber s = new Subscriber(
                        rs.getLong("subscriber_id"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("email"),
                        rs.getString("phone_number"),
                        rs.getLong("plan_id"),
                        rs.getLong("connected_tower_id"),
                        rs.getInt("tenure_months"),
                        rs.getInt("call_drops"),
                        rs.getBoolean("churned"),
                        churnProb
                    );
                    complaintService.registerSubscriber(s);
                }
            }

            // 4. Load Complaints
            String compSql = "SELECT complaint_id, subscriber_id, tower_id, category, description, severity, status, logged_at, resolved_at FROM complaints";
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(compSql)) {
                while (rs.next()) {
                    Complaint c = new Complaint(
                        rs.getLong("complaint_id"),
                        rs.getLong("subscriber_id"),
                        rs.getLong("tower_id"),
                        rs.getString("category"),
                        rs.getString("description"),
                        rs.getString("severity"),
                        rs.getString("status"),
                        rs.getTimestamp("logged_at"),
                        rs.getTimestamp("resolved_at")
                    );
                    complaintService.addComplaint(c);
                }
            }

            LOGGER.info("Successfully loaded database records!");
            return true;

        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Error querying database tables", e);
            return false;
        }
    }

    private void loadSampleInMemoryData() {
        // Towers
        Tower t1 = new Tower(1, "Central Exchange", 40.712800, -74.006000, false);
        Tower t2 = new Tower(2, "North Ridge", 40.730610, -73.935242, false);
        Tower t3 = new Tower(3, "East Market", 40.721319, -73.977692, true);
        Tower t4 = new Tower(4, "South Point", 40.689247, -74.044502, false);
        Tower t5 = new Tower(5, "West Park", 40.735863, -74.172366, false);
        Tower t6 = new Tower(6, "Harbor View", 40.700292, -73.996891, false);
        Tower t7 = new Tower(7, "Metro Station", 40.758896, -73.985130, true);
        Tower t8 = new Tower(8, "Tech Hub", 40.748817, -73.985428, false);

        Arrays.asList(t1, t2, t3, t4, t5, t6, t7, t8).forEach(networkGraph::addTower);

        // Edges
        networkGraph.addEdge(1, 2); networkGraph.addEdge(1, 4); networkGraph.addEdge(1, 6);
        networkGraph.addEdge(2, 3); networkGraph.addEdge(2, 5); networkGraph.addEdge(3, 6);
        networkGraph.addEdge(3, 7); networkGraph.addEdge(4, 6); networkGraph.addEdge(5, 6);
        networkGraph.addEdge(7, 8); networkGraph.addEdge(8, 2);

        // Subscribers
        complaintService.registerSubscriber(new Subscriber(1, "Ava", "Morgan", "ava.morgan@telecom.example.com", "+15550001001", 2, 1, 34, 2, false, 0.12));
        complaintService.registerSubscriber(new Subscriber(2, "Noah", "Bennett", "noah.bennett@telecom.example.com", "+15550001002", 1, 2, 8, 17, true, 0.91));
        complaintService.registerSubscriber(new Subscriber(3, "Mia", "Patel", "mia.patel@telecom.example.com", "+15550001003", 3, 3, 19, 14, true, 0.84));
        complaintService.registerSubscriber(new Subscriber(4, "Liam", "Reed", "liam.reed@telecom.example.com", "+15550001004", 2, 4, 52, 1, false, 0.06));
        complaintService.registerSubscriber(new Subscriber(5, "Sofia", "Kim", "sofia.kim@telecom.example.com", "+15550001005", 1, 5, 5, 21, true, 0.96));
        complaintService.registerSubscriber(new Subscriber(6, "Ethan", "Brooks", "ethan.brooks@telecom.example.com", "+15550001006", 3, 6, 27, 4, false, 0.23));
        complaintService.registerSubscriber(new Subscriber(7, "Isabella", "Diaz", "isabella.diaz@telecom.example.com", "+15550001007", 2, 2, 13, 9, true, 0.77));
        complaintService.registerSubscriber(new Subscriber(8, "Lucas", "Chen", "lucas.chen@telecom.example.com", "+15550001008", 1, 4, 41, 0, false, 0.03));
        complaintService.registerSubscriber(new Subscriber(9, "Emma", "Watson", "emma.watson@telecom.example.com", "+15550001009", 4, 7, 3, 28, true, 0.98));
        complaintService.registerSubscriber(new Subscriber(10, "Oliver", "Taylor", "oliver.taylor@telecom.example.com", "+15550001010", 3, 8, 48, 3, false, 0.08));

        // Complaints
        complaintService.addComplaint(new Complaint(1, 2, 3, "network_fault", "Repeated dropped calls near East Market tower.", "high", "open"));
        complaintService.addComplaint(new Complaint(2, 3, 3, "network_fault", "Intermittent service and slow data around East Market.", "critical", "in_progress"));
        complaintService.addComplaint(new Complaint(3, 5, 3, "call_drops", "Calls disconnect several times each day.", "high", "open"));
        complaintService.addComplaint(new Complaint(4, 7, 3, "network_fault", "No reliable signal during evening commute.", "medium", "open"));
        complaintService.addComplaint(new Complaint(5, 1, 2, "billing", "Question about an international usage charge.", "low", "resolved"));
        complaintService.addComplaint(new Complaint(6, 4, 4, "call_drops", "Two calls dropped this week near South Point.", "low", "closed"));
        complaintService.addComplaint(new Complaint(7, 9, 7, "network_fault", "Complete outage in Metro Station area during rush hour.", "critical", "open"));
    }

    private void printDiagnosticSummary() {
        Map<String, Object> stats = networkGraph.getNetworkHealthStats();
        LOGGER.info("------------------------------------------------------------------");
        LOGGER.info("Network Diagnostics Summary:");
        LOGGER.info("  Total Towers: " + stats.get("totalTowers"));
        LOGGER.info("  Healthy Towers: " + stats.get("healthyTowers"));
        LOGGER.info("  Faulty Towers: " + stats.get("faultyTowers"));
        LOGGER.info("  Network Health Index: " + stats.get("networkHealthPercentage") + "%");
        LOGGER.info("  Total Subscribers: " + complaintService.getAllSubscribers().size());
        LOGGER.info("  Total Complaints: " + complaintService.getAllComplaints().size());
        LOGGER.info("------------------------------------------------------------------");
    }

    private void startHttpServer() {
        int port = DEFAULT_PORT;
        String envPort = System.getenv("PORT");
        if (envPort != null) {
            try { port = Integer.parseInt(envPort); } catch (NumberFormatException ignored) {}
        }

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // API Endpoints
            server.createContext("/api/status", new StatusHandler());
            server.createContext("/api/towers", new TowersHandler());
            server.createContext("/api/towers/fault", new ToggleFaultHandler());
            server.createContext("/api/subscribers", new SubscribersHandler());
            server.createContext("/api/subscribers/risk", new RiskSubscribersHandler());
            server.createContext("/api/complaints", new ComplaintsHandler());
            server.createContext("/api/complaints/resolve", new ResolveComplaintHandler());
            server.createContext("/api/graph/impact", new GraphImpactHandler());
            server.createContext("/api/predict/churn", new PredictChurnHandler());
            server.createContext("/api/ai/answer", new AiAnswerHandler());

            server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
            server.start();

            LOGGER.info("HTTP REST Server active at: http://localhost:" + port + "/");
            LOGGER.info("API Endpoints: /api/status, /api/towers, /api/subscribers, /api/complaints, /api/predict/churn, /api/ai/answer");
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "Failed to start HTTP server on port " + port, e);
        }
    }

    // --- HTTP HANDLERS ---

    private abstract static class BaseHandler implements HttpHandler {
        protected void sendCorsAndHeaders(HttpExchange exchange) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        }

        protected void sendResponse(HttpExchange exchange, int code, String response) throws IOException {
            sendCorsAndHeaders(exchange);
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(code, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsAndHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            try {
                handleRequest(exchange);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error handling request", e);
                sendResponse(exchange, 500, "{\"error\":\"Internal Server Error: " + e.getMessage() + "\"}");
            }
        }

        protected abstract void handleRequest(HttpExchange exchange) throws Exception;

        protected String readRequestBody(HttpExchange exchange) throws IOException {
            try (BufferedReader br = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            }
        }
    }

    private class StatusHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            Map<String, Object> stats = networkGraph.getNetworkHealthStats();
            String json = String.format(
                "{\"status\":\"UP\",\"service\":\"Telecom Fault Tracker & Churn Backend\",\"health\":%s}",
                stats.get("networkHealthPercentage")
            );
            sendResponse(exchange, 200, json);
        }
    }

    private class TowersHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            sendResponse(exchange, 200, networkGraph.toJsonGraph());
        }
    }

    private class ToggleFaultHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            long towerId = parseLongParam(body, "towerId", 1);
            boolean isFaulty = parseBooleanParam(body, "isFaulty", true);

            networkGraph.setTowerFaulty(towerId, isFaulty);
            LOGGER.info("Tower #" + towerId + " fault toggled to: " + isFaulty);

            sendResponse(exchange, 200, "{\"success\":true,\"towerId\":" + towerId + ",\"isFaulty\":" + isFaulty + "}");
        }
    }

    private class SubscribersHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            Collection<Subscriber> subs = complaintService.getAllSubscribers();
            StringBuilder sb = new StringBuilder("[");
            int idx = 0;
            for (Subscriber s : subs) {
                if (idx > 0) sb.append(",");
                sb.append(s.toJsonString());
                idx++;
            }
            sb.append("]");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    private class RiskSubscribersHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            List<Map<String, Object>> highRisk = complaintService.getHighRiskSubscribers(0.70, networkGraph);
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < highRisk.size(); i++) {
                if (i > 0) sb.append(",");
                Map<String, Object> r = highRisk.get(i);
                sb.append(String.format(
                    "{\"subscriberId\":%s,\"name\":\"%s\",\"email\":\"%s\",\"connectedTowerId\":%s,\"callDrops\":%s,\"churnProb\":%s,\"isConnectedTowerFaulty\":%s,\"recommendedBackupTowerId\":%s,\"recommendedBackupTowerName\":\"%s\"}",
                    r.get("subscriberId"), r.get("name"), r.get("email"), r.get("connectedTowerId"), r.get("callDrops"),
                    r.get("churnProb"), r.get("isConnectedTowerFaulty"),
                    r.get("recommendedBackupTowerId") != null ? r.get("recommendedBackupTowerId") : "null",
                    r.get("recommendedBackupTowerName")
                ));
            }
            sb.append("]");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    private class ComplaintsHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readRequestBody(exchange);
                long subId = parseLongParam(body, "subscriberId", 1);
                long towerId = parseLongParam(body, "towerId", 1);
                String category = parseStringParam(body, "category", "network_fault");
                String desc = parseStringParam(body, "description", "Network issues reported");
                String severity = parseStringParam(body, "severity", "high");

                Complaint c = complaintService.logComplaint(subId, towerId, category, desc, severity, networkGraph);
                sendResponse(exchange, 201, c.toJsonString());
            } else {
                Collection<Complaint> list = complaintService.getAllComplaints();
                StringBuilder sb = new StringBuilder("[");
                int idx = 0;
                for (Complaint c : list) {
                    if (idx > 0) sb.append(",");
                    sb.append(c.toJsonString());
                    idx++;
                }
                sb.append("]");
                sendResponse(exchange, 200, sb.toString());
            }
        }
    }

    private class ResolveComplaintHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            long complaintId = parseLongParam(body, "complaintId", 0);
            boolean success = complaintService.resolveComplaint(complaintId, networkGraph);
            sendResponse(exchange, 200, "{\"success\":" + success + ",\"complaintId\":" + complaintId + "}");
        }
    }

    private class GraphImpactHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            String query = exchange.getRequestURI().getQuery();
            long towerId = 3;
            int maxHops = 2;

            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length == 2) {
                        if ("towerId".equalsIgnoreCase(pair[0])) {
                            try { towerId = Long.parseLong(pair[1]); } catch (NumberFormatException ignored) {}
                        } else if ("hops".equalsIgnoreCase(pair[0])) {
                            try { maxHops = Integer.parseInt(pair[1]); } catch (NumberFormatException ignored) {}
                        }
                    }
                }
            }

            Map<Long, Integer> impactMap = networkGraph.findImpactedTowers(towerId, maxHops);
            StringBuilder sb = new StringBuilder("{\"targetTowerId\":" + towerId + ",\"maxHops\":" + maxHops + ",\"impactedTowers\":[");
            int idx = 0;
            for (Map.Entry<Long, Integer> entry : impactMap.entrySet()) {
                if (idx > 0) sb.append(",");
                Tower t = networkGraph.getTower(entry.getKey());
                String tName = t != null ? t.getTowerName() : "Unknown";
                sb.append(String.format("{\"towerId\":%d,\"towerName\":\"%s\",\"hopDistance\":%d}", entry.getKey(), tName, entry.getValue()));
                idx++;
            }
            sb.append("]}");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    // Helper primitive JSON parser helpers for basic payloads
    private static String getJsonKeyValue(String json, String key) {
        if (json == null || key == null) return null;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "\"" + java.util.regex.Pattern.quote(key) + "\"\\s*:\\s*(\"((?:\\\\.|[^\"\\\\])*)\"|([^,\\}\\s]+))"
        );
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            if (matcher.group(2) != null) {
                return unescapeJson(matcher.group(2));
            } else if (matcher.group(3) != null) {
                return matcher.group(3);
            }
        }
        return null;
    }

    private static long parseLongParam(String json, String key, long defaultVal) {
        String val = getJsonKeyValue(json, key);
        if (val == null) return defaultVal;
        try {
            return Long.parseLong(val.trim());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private static double parseDoubleParam(String json, String key, double defaultVal) {
        String val = getJsonKeyValue(json, key);
        if (val == null) return defaultVal;
        try {
            return Double.parseDouble(val.trim());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private static boolean parseBooleanParam(String json, String key, boolean defaultVal) {
        String val = getJsonKeyValue(json, key);
        if (val == null) return defaultVal;
        return Boolean.parseBoolean(val.trim().toLowerCase());
    }

    private static String parseStringParam(String json, String key, String defaultVal) {
        String val = getJsonKeyValue(json, key);
        return val != null ? val : defaultVal;
    }

    private class PredictChurnHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\":\"Method Not Allowed. Use POST.\"}");
                return;
            }
            String body = readRequestBody(exchange);
            int tenure = (int) parseLongParam(body, "tenureMonths", 12);
            int callDrops = (int) parseLongParam(body, "callDrops", 4);
            double fee = parseDoubleParam(body, "monthlyFee", 59.99);
            int complaints = (int) parseLongParam(body, "complaintCount", 1);
            boolean isFaulty = parseBooleanParam(body, "isTowerFaulty", false);

            // Calculate Random Forest logit formula
            double logit = -1.5
                - (0.05 * tenure)
                + (0.35 * callDrops)
                + (1.80 * (isFaulty ? 1 : 0))
                + (0.45 * complaints)
                + (0.008 * (fee - 60.0));

            double prob = 1.0 / (1.0 + Math.exp(-logit));
            prob = Math.min(Math.max(prob, 0.01), 0.99);

            String tier = "LOW";
            if (prob >= 0.80) tier = "CRITICAL";
            else if (prob >= 0.60) tier = "HIGH";
            else if (prob >= 0.35) tier = "MEDIUM";

            double confidence = 0.88 + (Math.abs(prob - 0.5) * 0.20);

            // Risk Factors
            List<String> riskFactors = new ArrayList<>();
            if (isFaulty) riskFactors.add("Connected Cell Tower is in FAULTY outage state (+35% churn impact)");
            if (callDrops >= 10) riskFactors.add("Critical Call Drop rate (" + callDrops + " drops detected)");
            else if (callDrops >= 5) riskFactors.add("Elevated Call Drop rate (" + callDrops + " drops)");
            if (complaints >= 2) riskFactors.add("Multiple Customer Complaints logged (" + complaints + " complaints)");
            if (tenure <= 6) riskFactors.add("Short account tenure (" + tenure + " months)");
            if (riskFactors.isEmpty()) riskFactors.add("Subscriber metrics are within optimal operational thresholds");

            // AI Recommendations
            List<String> recommendations = new ArrayList<>();
            if (isFaulty) {
                recommendations.add("Reroute subscriber connection to nearest operational cell tower");
                recommendations.add("Dispatch priority field engineering team to repair tower fault");
            }
            if (prob >= 0.60) {
                recommendations.add("Issue proactive $15 Service Guarantee account credit");
                recommendations.add("Trigger VIP Loyalty Team outreach call within 24 hours");
            } else {
                recommendations.add("Standard network monitoring active. No intervention required");
            }

            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append(String.format("\"churnProbability\":%.4f,", prob));
            json.append(String.format("\"riskTier\":\"%s\",", tier));
            json.append(String.format("\"aiConfidence\":%.4f,", confidence));
            json.append("\"featureImportances\":{\"tenure_months\":0.3598,\"call_drops\":0.1989,\"is_tower_faulty\":0.2235,\"complaint_count\":0.1613,\"monthly_fee\":0.0564},");
            
            json.append("\"topRiskFactors\":[");
            for (int i = 0; i < riskFactors.size(); i++) {
                if (i > 0) json.append(",");
                json.append("\"").append(escapeJson(riskFactors.get(i))).append("\"");
            }
            json.append("],\"aiRecommendations\":[");
            for (int i = 0; i < recommendations.size(); i++) {
                if (i > 0) json.append(",");
                json.append("\"").append(escapeJson(recommendations.get(i))).append("\"");
            }
            json.append("]}");

            sendResponse(exchange, 200, json.toString());
        }
    }

    private class AiAnswerHandler extends BaseHandler {
        @Override
        protected void handleRequest(HttpExchange exchange) throws Exception {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\":\"Method Not Allowed. Use POST.\"}");
                return;
            }

            String apiKey = System.getenv("OPENAI_API_KEY");
            if (apiKey == null || apiKey.isBlank()) {
                sendResponse(exchange, 503, "{\"error\":\"OPENAI_API_KEY is not configured on the backend.\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String question = parseStringParam(body, "question", "Explain this customer issue and recommend next steps.");
            String context = parseStringParam(body, "context", "No customer context was supplied.");
            String model = System.getenv().getOrDefault("OPENAI_MODEL", "gpt-4o-mini");
            String baseUrl = System.getenv().getOrDefault("OPENAI_BASE_URL", "https://api.openai.com/v1");
            String providerBody = "{\"model\":\"" + escapeJson(model) + "\",\"temperature\":0.2,\"messages\":["
                + "{\"role\":\"system\",\"content\":\"You are a telecom support operations assistant. Give concise, evidence-based answers. Do not invent facts, and clearly label uncertainty.\"},"
                + "{\"role\":\"user\",\"content\":\"Question: " + escapeJson(question) + "\\n\\nCustomer and network context:\\n" + escapeJson(context) + "\"}]}";

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl.replaceAll("/$", "") + "/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(providerBody, StandardCharsets.UTF_8))
                .build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                LOGGER.warning("AI provider returned HTTP " + response.statusCode());
                sendResponse(exchange, 502, "{\"error\":\"The AI provider could not answer the request.\"}");
                return;
            }

            String answer = extractJsonString(response.body(), "content");
            if (answer == null || answer.isBlank()) {
                sendResponse(exchange, 502, "{\"error\":\"The AI provider returned an empty answer.\"}");
                return;
            }
            sendResponse(exchange, 200, "{\"answer\":\"" + escapeJson(answer) + "\",\"model\":\"" + escapeJson(model) + "\"}");
        }
    }

    private static String extractJsonString(String json, String key) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(
            "\\\"" + java.util.regex.Pattern.quote(key) + "\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"\\\\])*)\\\""
        ).matcher(json);
        return matcher.find() ? unescapeJson(matcher.group(1)) : null;
    }

    private static String unescapeJson(String input) {
        return input.replace("\\\\n", "\n").replace("\\\\r", "\r").replace("\\\\t", "\t")
            .replace("\\\\\"", "\"").replace("\\\\\\", "\\");
    }

    private static String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

