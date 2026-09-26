package com.telecom.models;

import java.sql.Timestamp;

/**
 * Model class representing a Customer Complaint entity.
 */
public class Complaint {
    private long complaintId;
    private long subscriberId;
    private long towerId;
    private String category;
    private String description;
    private String severity; // 'low', 'medium', 'high', 'critical'
    private String status;   // 'open', 'in_progress', 'resolved', 'closed'
    private Timestamp loggedAt;
    private Timestamp resolvedAt;

    public Complaint() {
    }

    public Complaint(long complaintId, long subscriberId, long towerId, String category,
                     String description, String severity, String status) {
        this.complaintId = complaintId;
        this.subscriberId = subscriberId;
        this.towerId = towerId;
        this.category = category;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.loggedAt = new Timestamp(System.currentTimeMillis());
    }

    public Complaint(long complaintId, long subscriberId, long towerId, String category,
                     String description, String severity, String status,
                     Timestamp loggedAt, Timestamp resolvedAt) {
        this.complaintId = complaintId;
        this.subscriberId = subscriberId;
        this.towerId = towerId;
        this.category = category;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.loggedAt = loggedAt;
        this.resolvedAt = resolvedAt;
    }

    public long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(long complaintId) {
        this.complaintId = complaintId;
    }

    public long getSubscriberId() {
        return subscriberId;
    }

    public void setSubscriberId(long subscriberId) {
        this.subscriberId = subscriberId;
    }

    public long getTowerId() {
        return towerId;
    }

    public void setTowerId(long towerId) {
        this.towerId = towerId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(Timestamp loggedAt) {
        this.loggedAt = loggedAt;
    }

    public Timestamp getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Timestamp resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String toJsonString() {
        return String.format(
            "{\"complaintId\":%d,\"subscriberId\":%d,\"towerId\":%d,\"category\":\"%s\",\"description\":\"%s\",\"severity\":\"%s\",\"status\":\"%s\",\"loggedAt\":\"%s\"}",
            complaintId,
            subscriberId,
            towerId,
            escapeJson(category),
            escapeJson(description),
            escapeJson(severity),
            escapeJson(status),
            loggedAt != null ? loggedAt.toString() : ""
        );
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Override
    public String toString() {
        return "Complaint{" +
                "complaintId=" + complaintId +
                ", subscriberId=" + subscriberId +
                ", towerId=" + towerId +
                ", category='" + category + '\'' +
                ", severity='" + severity + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
