package ru.bmstu.controller;

import ru.bmstu.model.User;
import ru.bmstu.service.UserService;
import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequestMapping("/api/users")
public class UserController {


    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping
    public List<User> getUsers() {
        return userService.findAll();
    }


    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
