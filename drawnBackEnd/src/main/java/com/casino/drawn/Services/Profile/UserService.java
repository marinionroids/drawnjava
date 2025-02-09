package com.casino.drawn.Services.Profile;



import com.casino.drawn.DTO.UserProfile.ProfileResponse;
import com.casino.drawn.DTO.UserProfile.ProfileRequest;
import com.casino.drawn.DTO.UserProfile.UserProfileResponse;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.JWT.JwtUtil;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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

    public String cleanUsername(String input) {
        if (input == null) {
            return null;
        }
        return input.toLowerCase().replaceAll("[^a-zA-Z0-9\\-_]", "");

    }

    public ProfileResponse changeProfileData(String token, ProfileRequest profileRequest) {
        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        String cleanUsername = cleanUsername(profileRequest.getUsername());
        if (user != null) {
            // Check whether the username already exists and ITS NOT THIS USER.
            if (userRepository.existsByUsername(cleanUsername) && !Objects.equals(user.getUsername(), cleanUsername)) {
                return new ProfileResponse("USERNAME_EXISTS","Username Already Exists");
            }
            user.setUsername(cleanUsername);
            userRepository.save(user);
            return new ProfileResponse("USERNAME_UPDATED","Profile Updated");
        }
        return new ProfileResponse("INVALID_TOKEN","Authentication Failed");
    }


}
