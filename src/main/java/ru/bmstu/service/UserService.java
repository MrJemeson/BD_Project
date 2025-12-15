package ru.bmstu.service;

import org.springframework.stereotype.Service;
import ru.bmstu.model.User;
import ru.bmstu.repository.UserRepository;

import java.util.List;
import java.util.Optional;


@Service
public class UserService {


    private final UserRepository userRepository;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public List<User> findAll() {
        return userRepository.findAll();
    }


    public User save(User user) {
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password));
    }
}
