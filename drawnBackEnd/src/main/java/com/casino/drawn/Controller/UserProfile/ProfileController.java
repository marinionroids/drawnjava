package com.casino.drawn.Controller.UserProfile;
import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import com.casino.drawn.DTO.UserProfile.ProfileResponse;
import com.casino.drawn.DTO.UserProfile.ProfileRequest;
import com.casino.drawn.DTO.UserProfile.UserProfileResponse;
import com.casino.drawn.Services.Profile.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserService userService;


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
        ProfileResponse respone = userService.changeProfileData(token, profileRequest);
        if(respone.getCode().equals("USERNAME_UPDATED")) {
            return ResponseEntity
                    .ok()
                    .body(new ApiResponse(
                            true,
                            "Username has been changed.",
                            respone
                    ));
        }
        if (respone.getCode().equals("INVALID_TOKEN")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Authentication failed",
                            new ErrorDetails("INVALID_TOKEN", "Invalid or expired token")
                    ));
        }
        if (respone.getCode().equals("USERNAME_EXISTS")) {
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
}
