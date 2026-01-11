package ru.bmstu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/**").permitAll() // Временно разрешено для тестирования
                        .requestMatchers("/api/client/**").permitAll() // Разрешено для клиентов
                        .requestMatchers("/api/manager/**").permitAll() // Разрешено для менеджеров
                        .requestMatchers("/api/dispatcher/**").permitAll() // Разрешено для диспетчеров
                        .requestMatchers("/api/department-employee/**").permitAll() // Разрешено для сотрудников отдела
                        .requestMatchers("/api/doc-employee/**").permitAll() // Разрешено для сотрудников по документации
                        .anyRequest().permitAll()
                )

                // отключаем стандартные способы логина
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // включаем сессии для поддержания аутентификации
                .sessionManagement(session -> session
                        .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
                );

        return http.build();
    }
}