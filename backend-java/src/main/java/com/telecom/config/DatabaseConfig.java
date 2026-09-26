package com.telecom.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Database configuration & JDBC connection manager.
 */
public class DatabaseConfig {

    private static final Logger LOGGER = Logger.getLogger(DatabaseConfig.class.getName());

    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/telecom_fault_tracker?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "root";

    private static String dbUrl;
    private static String dbUser;
    private static String dbPassword;

    static {
        dbUrl = System.getenv().getOrDefault("DB_URL", DEFAULT_URL);
        dbUser = System.getenv().getOrDefault("DB_USER", DEFAULT_USER);
        dbPassword = System.getenv().getOrDefault("DB_PASSWORD", DEFAULT_PASSWORD);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.WARNING, "MySQL JDBC Driver not found on classpath. Ensure mysql-connector-j is included.", e);
        }
    }

    /**
     * Gets a new JDBC Connection to MySQL.
     * @return Connection object or null if unavailable
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    /**
     * Tests whether the MySQL database is reachable.
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            LOGGER.log(Level.INFO, "Database connection check failed ({0}). Running with in-memory fallback state.", e.getMessage());
            return false;
        }
    }

    public static String getDbUrl() {
        return dbUrl;
    }
}
