package com.casino.drawn.Controller.UserProfile;
import com.casino.drawn.DTO.UserProfile.UserProfileResponse;
import com.casino.drawn.Services.Profile.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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
            return ResponseEntity.badRequest().body("Invalid token");
        }
        return ResponseEntity.ok(response);
    }
}
