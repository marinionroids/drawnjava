package com.casino.drawn.Services.Profile;



import com.casino.drawn.DTO.UserProfile.UserProfileResponse;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Solana.SecretKeyPairRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.JWT.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private SecretKeyPairRepository secretKeyPairRepository;


    // Deducts the Lootbox value from the user Balance.
    public void deductBalance(Integer userId, Float amount) {
        User user = userRepository.findByUserId(userId);
        if (user.getBalance() > amount) {
            user.setBalance(user.getBalance() - amount);
            userRepository.save(user);        }

    }

    public void addWonItemValueToBalance(Integer userId, Float amount) {
        User user = userRepository.findByUserId(userId);
        user.setBalance(user.getBalance() + amount);
        userRepository.save(user);
    }

    public ResponseEntity<?> checkForSufficientBalance(Integer userId, Float amount) {
        User user = userRepository.findByUserId(userId);
        Map<String, Object> response = new HashMap<>();
        if (user.getBalance() < amount) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }


    public UserProfileResponse getUserDetails(String token) {
        UserProfileResponse userProfileResponse = new UserProfileResponse();
        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        if (user != null) {
            userProfileResponse.setUserId(user.getUserId());
            userProfileResponse.setBalance(user.getBalance());
            userProfileResponse.setUsername(user.getUsername());
            userProfileResponse.setRecievingAddress(user.getRecieverAddress());
            return userProfileResponse;
        }
        return null;
    }



}
