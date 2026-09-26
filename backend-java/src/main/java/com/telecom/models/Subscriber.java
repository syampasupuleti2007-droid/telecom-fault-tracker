package com.telecom.models;

import java.sql.Timestamp;

/**
 * Model class representing a Subscriber entity in the telecom system.
 */
public class Subscriber {
    private long subscriberId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private long planId;
    private long connectedTowerId;
    private int tenureMonths;
    private int callDrops;
    private boolean churned;
    private Double churnProb;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Subscriber() {
    }

    public Subscriber(long subscriberId, String firstName, String lastName, String email, String phoneNumber,
                      long planId, long connectedTowerId, int tenureMonths, int callDrops,
                      boolean churned, Double churnProb) {
        this.subscriberId = subscriberId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.planId = planId;
        this.connectedTowerId = connectedTowerId;
        this.tenureMonths = tenureMonths;
        this.callDrops = callDrops;
        this.churned = churned;
        this.churnProb = churnProb;
    }

    public long getSubscriberId() {
        return subscriberId;
    }

    public void setSubscriberId(long subscriberId) {
        this.subscriberId = subscriberId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public long getPlanId() {
        return planId;
    }

    public void setPlanId(long planId) {
        this.planId = planId;
    }

    public long getConnectedTowerId() {
        return connectedTowerId;
    }

    public void setConnectedTowerId(long connectedTowerId) {
        this.connectedTowerId = connectedTowerId;
    }

    public int getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(int tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public int getCallDrops() {
        return callDrops;
    }

    public void setCallDrops(int callDrops) {
        this.callDrops = callDrops;
    }

    public boolean isChurned() {
        return churned;
    }

    public void setChurned(boolean churned) {
        this.churned = churned;
    }

    public Double getChurnProb() {
        return churnProb;
    }

    public void setChurnProb(Double churnProb) {
        this.churnProb = churnProb;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String toJsonString() {
        String probVal = (churnProb == null) ? "null" : String.format("%.4f", churnProb);
        return String.format(
            "{\"subscriberId\":%d,\"name\":\"%s %s\",\"email\":\"%s\",\"phone\":\"%s\",\"planId\":%d,\"connectedTowerId\":%d,\"tenureMonths\":%d,\"callDrops\":%d,\"churned\":%b,\"churnProb\":%s}",
            subscriberId,
            escapeJson(firstName),
            escapeJson(lastName),
            escapeJson(email),
            escapeJson(phoneNumber),
            planId,
            connectedTowerId,
            tenureMonths,
            callDrops,
            churned,
            probVal
        );
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Override
    public String toString() {
        return "Subscriber{" +
                "subscriberId=" + subscriberId +
                ", name='" + getFullName() + '\'' +
                ", connectedTowerId=" + connectedTowerId +
                ", callDrops=" + callDrops +
                ", churnProb=" + churnProb +
                '}';
    }
}
