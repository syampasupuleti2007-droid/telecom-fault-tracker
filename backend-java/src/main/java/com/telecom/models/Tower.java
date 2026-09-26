package com.telecom.models;

import java.sql.Timestamp;

/**
 * Model class representing a Cell Tower entity in the telecom network.
 */
public class Tower {
    private long towerId;
    private String towerName;
    private double latitude;
    private double longitude;
    private boolean isFaulty;
    private Timestamp createdAt;

    public Tower() {
    }

    public Tower(long towerId, String towerName, double latitude, double longitude, boolean isFaulty) {
        this.towerId = towerId;
        this.towerName = towerName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isFaulty = isFaulty;
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    public Tower(long towerId, String towerName, double latitude, double longitude, boolean isFaulty, Timestamp createdAt) {
        this.towerId = towerId;
        this.towerName = towerName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isFaulty = isFaulty;
        this.createdAt = createdAt;
    }

    public long getTowerId() {
        return towerId;
    }

    public void setTowerId(long towerId) {
        this.towerId = towerId;
    }

    public String getTowerName() {
        return towerName;
    }

    public void setTowerName(String towerName) {
        this.towerName = towerName;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public boolean isFaulty() {
        return isFaulty;
    }

    public void setFaulty(boolean faulty) {
        isFaulty = faulty;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String toJsonString() {
        return String.format(
            "{\"towerId\":%d,\"towerName\":\"%s\",\"latitude\":%.6f,\"longitude\":%.6f,\"isFaulty\":%b}",
            towerId,
            escapeJson(towerName),
            latitude,
            longitude,
            isFaulty
        );
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Override
    public String toString() {
        return "Tower{" +
                "towerId=" + towerId +
                ", towerName='" + towerName + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", isFaulty=" + isFaulty +
                '}';
    }
}
