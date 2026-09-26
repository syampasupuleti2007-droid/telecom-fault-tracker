package com.telecom.graph;

import com.telecom.models.Tower;

import java.util.*;
import java.util.logging.Logger;

/**
 * Graph Data Structure representing the cell tower mesh network topology.
 * Supports BFS traversal, fault propagation analysis, and backup tower rerouting.
 */
public class TowerNetworkGraph {

    private static final Logger LOGGER = Logger.getLogger(TowerNetworkGraph.class.getName());

    // Map towerId -> Tower node
    private final Map<Long, Tower> towerNodes = new HashMap<>();

    // Adjacency List: Map towerId -> Set of connected towerIds
    private final Map<Long, Set<Long>> adjacencyList = new HashMap<>();

    public TowerNetworkGraph() {
    }

    /**
     * Adds a cell tower node to the graph.
     */
    public synchronized void addTower(Tower tower) {
        if (tower == null) return;
        towerNodes.put(tower.getTowerId(), tower);
        adjacencyList.putIfAbsent(tower.getTowerId(), new HashSet<>());
    }

    /**
     * Adds an undirected network connection (edge) between two towers.
     */
    public synchronized void addEdge(long u, long v) {
        if (u == v) return;
        if (!towerNodes.containsKey(u) || !towerNodes.containsKey(v)) {
            LOGGER.warning("Cannot add edge between " + u + " and " + v + ": One or both towers do not exist in graph.");
            return;
        }
        adjacencyList.putIfAbsent(u, new HashSet<>());
        adjacencyList.putIfAbsent(v, new HashSet<>());

        adjacencyList.get(u).add(v);
        adjacencyList.get(v).add(u);
    }

    public synchronized Tower getTower(long towerId) {
        return towerNodes.get(towerId);
    }

    public synchronized Collection<Tower> getAllTowers() {
        return new ArrayList<>(towerNodes.values());
    }

    public synchronized Set<Long> getNeighbors(long towerId) {
        return adjacencyList.getOrDefault(towerId, Collections.emptySet());
    }

    /**
     * Updates the fault status of a cell tower.
     */
    public synchronized void setTowerFaulty(long towerId, boolean isFaulty) {
        Tower tower = towerNodes.get(towerId);
        if (tower != null) {
            tower.setFaulty(isFaulty);
        }
    }

    /**
     * Uses Breadth-First Search (BFS) to find all towers impacted within maxHops of a faulty tower.
     * @param faultyTowerId ID of the originating faulty tower
     * @param maxHops Radius in network hops
     * @return Map of towerId -> distance in hops
     */
    public synchronized Map<Long, Integer> findImpactedTowers(long faultyTowerId, int maxHops) {
        Map<Long, Integer> impactedMap = new LinkedHashMap<>();
        if (!towerNodes.containsKey(faultyTowerId)) {
            return impactedMap;
        }

        Queue<Long> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();

        queue.add(faultyTowerId);
        visited.add(faultyTowerId);
        impactedMap.put(faultyTowerId, 0);

        while (!queue.isEmpty()) {
            long current = queue.poll();
            int currentDist = impactedMap.get(current);

            if (currentDist >= maxHops) continue;

            for (long neighborId : getNeighbors(current)) {
                if (!visited.contains(neighborId)) {
                    visited.add(neighborId);
                    impactedMap.put(neighborId, currentDist + 1);
                    queue.add(neighborId);
                }
            }
        }

        return impactedMap;
    }

    /**
     * Finds the best non-faulty backup tower for a subscriber connected to a faulty tower.
     * Searches immediate neighbors first, then 2-hop neighbors.
     */
    public synchronized Tower findBackupTower(long subscriberTowerId) {
        Set<Long> directNeighbors = getNeighbors(subscriberTowerId);

        // 1st Priority: Immediate operational neighbor
        for (long neighborId : directNeighbors) {
            Tower t = towerNodes.get(neighborId);
            if (t != null && !t.isFaulty()) {
                return t;
            }
        }

        // 2nd Priority: 2-hop operational neighbor
        for (long neighborId : directNeighbors) {
            for (long secondHopId : getNeighbors(neighborId)) {
                if (secondHopId != subscriberTowerId && !directNeighbors.contains(secondHopId)) {
                    Tower t = towerNodes.get(secondHopId);
                    if (t != null && !t.isFaulty()) {
                        return t;
                    }
                }
            }
        }

        return null; // No healthy tower within reach
    }

    /**
     * Computes the shortest path route between two towers using BFS.
     * @return List of towerIds along the path
     */
    public synchronized List<Long> findShortestPath(long sourceId, long targetId) {
        if (!towerNodes.containsKey(sourceId) || !towerNodes.containsKey(targetId)) {
            return Collections.emptyList();
        }

        Map<Long, Long> parentMap = new HashMap<>();
        Queue<Long> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();

        queue.add(sourceId);
        visited.add(sourceId);
        parentMap.put(sourceId, null);

        boolean found = false;
        while (!queue.isEmpty()) {
            long current = queue.poll();
            if (current == targetId) {
                found = true;
                break;
            }

            for (long neighbor : getNeighbors(current)) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parentMap.put(neighbor, current);
                    queue.add(neighbor);
                }
            }
        }

        if (!found) return Collections.emptyList();

        List<Long> path = new ArrayList<>();
        Long curr = targetId;
        while (curr != null) {
            path.add(0, curr);
            curr = parentMap.get(curr);
        }
        return path;
    }

    /**
     * Returns network health statistics.
     */
    public synchronized Map<String, Object> getNetworkHealthStats() {
        int total = towerNodes.size();
        long faultyCount = towerNodes.values().stream().filter(Tower::isFaulty).count();
        long healthyCount = total - faultyCount;
        double healthPct = total == 0 ? 100.0 : (healthyCount * 100.0 / total);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTowers", total);
        stats.put("healthyTowers", healthyCount);
        stats.put("faultyTowers", faultyCount);
        stats.put("networkHealthPercentage", Math.round(healthPct * 100.0) / 100.0);
        return stats;
    }

    public synchronized String toJsonGraph() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"nodes\":[");
        int nodeIdx = 0;
        for (Tower t : towerNodes.values()) {
            if (nodeIdx > 0) sb.append(",");
            sb.append(t.toJsonString());
            nodeIdx++;
        }
        sb.append("],\"edges\":[");
        int edgeIdx = 0;
        Set<String> processedEdges = new HashSet<>();

        for (Map.Entry<Long, Set<Long>> entry : adjacencyList.entrySet()) {
            long u = entry.getKey();
            for (long v : entry.getValue()) {
                String edgeKey = u < v ? u + "-" + v : v + "-" + u;
                if (!processedEdges.contains(edgeKey)) {
                    processedEdges.add(edgeKey);
                    if (edgeIdx > 0) sb.append(",");
                    sb.append(String.format("{\"source\":%d,\"target\":%d}", u, v));
                    edgeIdx++;
                }
            }
        }
        sb.append("]}");
        return sb.toString();
    }
}
