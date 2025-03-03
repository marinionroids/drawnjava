package com.casino.drawn.controller.userprofile;
import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.api.ErrorDetails;
import com.casino.drawn.dto.userprofile.ProfileResponse;
import com.casino.drawn.dto.userprofile.ProfileRequest;
import com.casino.drawn.dto.userprofile.UserProfileResponse;
import com.casino.drawn.services.profile.ProfileService;
import com.casino.drawn.services.profile.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")

public class ProfileController {

    @Autowired
    private UserService userService;
    @Autowired
    private ProfileService profileService;


    @GetMapping("/user")
    public ResponseEntity<?> getUserData(@RequestHeader("Authorization") String token) {
        UserProfileResponse response = userService.getUserDetails(token);

        if (response == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(
                            false,
                            "Authentication failed",
                            new ErrorDetails("INVALID_TOKEN", "Invalid or expired token")
                    ));
        }
        return ResponseEntity
                .ok()
                .body(new ApiResponse(
                        true,
                        "Valid User Authentication"
                        , response
                ));
    }


    @PostMapping("/user")
    public ResponseEntity<?> changeProfileData(@RequestHeader("Authorization") String token,
                                                @RequestBody ProfileRequest profileRequest) {
        ApiResponse respone = userService.changeProfileData(token, profileRequest);
        if(respone.getMessage().equals("USERNAME_UPDATED")) {
            return ResponseEntity
                    .ok()
                    .body(new ApiResponse(
                            true,
                            "Username has been changed.",
                            respone
                    ));
        }
        if (respone.getMessage().equals("INVALID_TOKEN")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Authentication failed",
                            new ErrorDetails("INVALID_TOKEN", "Invalid or expired token")
                    ));
        }
        if (respone.getMessage().equals("USERNAME_EXISTS")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Username already exists",
                            new ErrorDetails("USERNAME_EXISTS", "Username already exists")
                    ));
        }
        return ResponseEntity
                .badRequest()
                .body(new ApiResponse(
                        false,
                        "An error has occurred",
                        new ErrorDetails("INVALID_REQUEST", "Something went wrong")
                ));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfileData(@RequestHeader("Authorization") String token) {

        ApiResponse response = profileService.getProfileData(token);
        return ResponseEntity.ok(response);
    }
}
