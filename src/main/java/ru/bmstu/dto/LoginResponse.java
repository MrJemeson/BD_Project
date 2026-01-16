package ru.bmstu.dto;

public class LoginResponse {
    public String username;
    public String role;
    public String redirectUrl;

    public LoginResponse(String username, String role, String redirectUrl) {
        this.username = username;
        this.role = role;
        this.redirectUrl = redirectUrl;
    }
}
