package com.casino.drawn.services.profile;



import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.userprofile.ProfileResponse;
import com.casino.drawn.dto.userprofile.ProfileRequest;
import com.casino.drawn.dto.userprofile.UserProfileResponse;
import com.casino.drawn.model.User;
import com.casino.drawn.repository.UserRepository;
import com.casino.drawn.services.jwt.JwtUtil;
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

    public ApiResponse changeProfileData(String token, ProfileRequest profileRequest) {
        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        String cleanUsername = cleanUsername(profileRequest.getUsername());
        if (user != null) {
            // Check whether the username already exists and ITS NOT THIS USER.
            if (userRepository.existsByUsername(cleanUsername) && !Objects.equals(user.getUsername(), cleanUsername)) {
                return new ApiResponse(false, "USERNAME_EXISTS",null);
            }
            user.setUsername(cleanUsername);
            userRepository.save(user);
            return new ApiResponse(true, "USERNAME_UPDATED",null);
        }
        return new ApiResponse(false, "INVALID_TOKEN",null);
    }


}
