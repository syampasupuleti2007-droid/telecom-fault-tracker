package com.telecom.services;

import com.telecom.graph.TowerNetworkGraph;
import com.telecom.models.Complaint;
import com.telecom.models.Subscriber;
import com.telecom.models.Tower;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * Service class handling complaint processing, tower fault correlation,
 * and high-risk subscriber identification.
 */
public class ComplaintService {

    private static final Logger LOGGER = Logger.getLogger(ComplaintService.class.getName());
    private static final int FAULT_COMPLAINT_THRESHOLD = 3;

    private final Map<Long, Complaint> complaintStore = new HashMap<>();
    private final Map<Long, Subscriber> subscriberStore = new HashMap<>();
    private final AtomicLong complaintIdGenerator = new AtomicLong(100);

    public ComplaintService() {
    }

    public synchronized void registerSubscriber(Subscriber subscriber) {
        if (subscriber != null) {
            subscriberStore.put(subscriber.getSubscriberId(), subscriber);
        }
    }

    public synchronized Subscriber getSubscriber(long subscriberId) {
        return subscriberStore.get(subscriberId);
    }

    public synchronized Collection<Subscriber> getAllSubscribers() {
        return new ArrayList<>(subscriberStore.values());
    }

    public synchronized Complaint logComplaint(long subscriberId, long towerId, String category,
                                             String description, String severity, TowerNetworkGraph graph) {
        long complaintId = complaintIdGenerator.incrementAndGet();
        Complaint complaint = new Complaint(complaintId, subscriberId, towerId, category, description, severity, "open");
        complaintStore.put(complaintId, complaint);

        LOGGER.info("Logged new complaint #" + complaintId + " for tower " + towerId + " (Severity: " + severity + ")");

        // Evaluate whether complaint volume triggers auto-fault detection on tower
        evaluateTowerFaultStatus(towerId, graph);

        return complaint;
    }

    public synchronized void addComplaint(Complaint complaint) {
        if (complaint != null) {
            complaintStore.put(complaint.getComplaintId(), complaint);
            if (complaint.getComplaintId() >= complaintIdGenerator.get()) {
                complaintIdGenerator.set(complaint.getComplaintId() + 1);
            }
        }
    }

    public synchronized Complaint getComplaint(long complaintId) {
        return complaintStore.get(complaintId);
    }

    public synchronized Collection<Complaint> getAllComplaints() {
        return new ArrayList<>(complaintStore.values());
    }

    public synchronized List<Complaint> getComplaintsByTower(long towerId) {
        return complaintStore.values().stream()
                .filter(c -> c.getTowerId() == towerId)
                .collect(Collectors.toList());
    }

    public synchronized List<Complaint> getComplaintsBySubscriber(long subscriberId) {
        return complaintStore.values().stream()
                .filter(c -> c.getSubscriberId() == subscriberId)
                .collect(Collectors.toList());
    }

    /**
     * Checks open/critical complaints for a tower and automatically sets the tower as faulty
     * if open complaint count exceeds FAULT_COMPLAINT_THRESHOLD.
     */
    public synchronized boolean evaluateTowerFaultStatus(long towerId, TowerNetworkGraph graph) {
        long activeComplaintsCount = complaintStore.values().stream()
                .filter(c -> c.getTowerId() == towerId)
                .filter(c -> "open".equalsIgnoreCase(c.getStatus()) || "in_progress".equalsIgnoreCase(c.getStatus()))
                .count();

        boolean shouldBeFaulty = activeComplaintsCount >= FAULT_COMPLAINT_THRESHOLD;

        if (graph != null) {
            Tower t = graph.getTower(towerId);
            if (t != null && t.isFaulty() != shouldBeFaulty) {
                graph.setTowerFaulty(towerId, shouldBeFaulty);
                LOGGER.info("Tower " + towerId + " (" + t.getTowerName() + ") fault status updated to: " + shouldBeFaulty +
                            " (Active complaints: " + activeComplaintsCount + ")");
            }
        }
        return shouldBeFaulty;
    }

    /**
     * Resolves a complaint and updates tower health evaluation.
     */
    public synchronized boolean resolveComplaint(long complaintId, TowerNetworkGraph graph) {
        Complaint complaint = complaintStore.get(complaintId);
        if (complaint == null) return false;

        complaint.setStatus("resolved");
        complaint.setResolvedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        evaluateTowerFaultStatus(complaint.getTowerId(), graph);
        return true;
    }

    /**
     * Identifies subscribers connected to faulty towers or having high churn probabilities.
     */
    public synchronized List<Map<String, Object>> getHighRiskSubscribers(double churnThreshold, TowerNetworkGraph graph) {
        List<Map<String, Object>> riskList = new ArrayList<>();

        for (Subscriber sub : subscriberStore.values()) {
            boolean isTowerFaulty = false;
            if (graph != null) {
                Tower tower = graph.getTower(sub.getConnectedTowerId());
                if (tower != null && tower.isFaulty()) {
                    isTowerFaulty = true;
                }
            }

            double churnProb = sub.getChurnProb() != null ? sub.getChurnProb() : 0.0;
            if (churnProb >= churnThreshold || isTowerFaulty || sub.getCallDrops() >= 15) {
                Map<String, Object> record = new HashMap<>();
                record.put("subscriberId", sub.getSubscriberId());
                record.put("name", sub.getFullName());
                record.put("email", sub.getEmail());
                record.put("phone", sub.getPhoneNumber());
                record.put("connectedTowerId", sub.getConnectedTowerId());
                record.put("tenureMonths", sub.getTenureMonths());
                record.put("callDrops", sub.getCallDrops());
                record.put("churnProb", churnProb);
                record.put("churned", sub.isChurned());
                record.put("isConnectedTowerFaulty", isTowerFaulty);

                Tower backup = graph != null ? graph.findBackupTower(sub.getConnectedTowerId()) : null;
                record.put("recommendedBackupTowerId", backup != null ? backup.getTowerId() : null);
                record.put("recommendedBackupTowerName", backup != null ? backup.getTowerName() : "None Available");

                riskList.add(record);
            }
        }

        riskList.sort((a, b) -> Double.compare((Double) b.get("churnProb"), (Double) a.get("churnProb")));
        return riskList;
    }
}
