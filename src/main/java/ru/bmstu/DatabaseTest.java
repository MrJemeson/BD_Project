package ru.bmstu;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseTest {
    public static void main(String[] args) {
        System.out.println("=== Database Connection Test ===");
        testDatabaseConnection();

        System.out.println("\n=== API Test ===");
        testAPIConnection();
    }

    private static void testDatabaseConnection() {
        String url = "jdbc:postgresql://localhost:5432/facility";
        String username = "postgres";
        String password = "1234";

        try {
            System.out.println("Connecting to database...");
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("✅ Connected successfully!");

            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT current_database(), current_user");

            if (resultSet.next()) {
                System.out.println("📊 Current database: " + resultSet.getString(1));
                System.out.println("👤 Current user: " + resultSet.getString(2));
            }

            // Check if tables exist
            ResultSet tables = connection.getMetaData().getTables(null, "public", "%", new String[]{"TABLE"});
            System.out.println("📋 Existing tables:");
            int tableCount = 0;
            while (tables.next()) {
                System.out.println("  - " + tables.getString("TABLE_NAME"));
                tableCount++;
            }
            System.out.println("Total tables: " + tableCount);

            connection.close();
            System.out.println("🔌 Connection closed.");

        } catch (Exception e) {
            System.err.println("❌ Connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testAPIConnection() {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:8081/api/admin/tables"))
                    .build();

            System.out.println("Testing API connection...");
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("✅ API is responding!");
                System.out.println("Response: " + response.body());
            } else {
                System.out.println("⚠️ API responded with status: " + response.statusCode());
            }

        } catch (IOException | InterruptedException e) {
            System.out.println("❌ API is not available: " + e.getMessage());
            System.out.println("💡 Make sure Spring Boot application is running on port 8081");
        }
    }
}

