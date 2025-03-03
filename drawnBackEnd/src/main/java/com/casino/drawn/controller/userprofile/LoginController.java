package com.casino.drawn.Controller.UserProfile;

import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import com.casino.drawn.DTO.Solana.WalletVerificationDTO;
import com.casino.drawn.DTO.UserProfile.AuthResponse;
import com.casino.drawn.Services.JWT.JwtUtil;
import com.casino.drawn.Services.Profile.LoginService;
import com.casino.drawn.Services.Profile.UserWalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://drawngg.com")
public class LoginController {

    private final LoginService loginService;
    private final JwtUtil jwtUtil;
    private final UserWalletService userWalletService;

    public LoginController(LoginService loginService, JwtUtil jwtUtil, UserWalletService userWalletService) {
        this.loginService = loginService;
        this.jwtUtil = jwtUtil;
        this.userWalletService = userWalletService;
    }

    @PostMapping("/auth/verify") // LOGIN ENDPOINT , their CONNECT SIGNATURE FROM SOLFLARE gets validated, once true, they get a valid JWT for 1 day. We also check whether the user is new.
    public ResponseEntity<?> verifyWallet(@RequestBody WalletVerificationDTO request) {

        try {
            boolean isValid = loginService.verifyConnectSignature(request);
            // Verify Login and Deal with new users.
            if (isValid){
                String token = jwtUtil.generateToken(request.getWalletAddress());
                userWalletService.verifyUserOrCreate(request.getWalletAddress());
                loginService.logUserLogin(request.getWalletAddress());
                return ResponseEntity
                        .ok()
                        .body(new ApiResponse(
                                true,
                                "Login in successfully",
                                new AuthResponse(
                                        token)
                        ));
            }
            else {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(
                                false,
                                "Login in verification failed",
                                new ErrorDetails("INVALID_TOKEN", "Unable to verify Authentication Token")
                        ));
            }
        } catch (Exception e){

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            false,
                            "Internal server error",
                            new ErrorDetails("SERVER_ERROR", e.getMessage())
                    ));

        }








    }

    @GetMapping("/auth/verify")
    public ResponseEntity<?> verifyWalletLogin(@RequestHeader("Authorization") String token) {

        // Validate JWT token.
       try {
           if (jwtUtil.validateToken(token) != null) {
               return ResponseEntity
                       .ok()
                       .body(new ApiResponse(
                               true,
                               "Login in successfully",
                               new AuthResponse(
                                       token)
                       ));

           }

           return ResponseEntity
                   .status(HttpStatus.BAD_REQUEST)
                   .body(new ApiResponse(
                           false,
                           "Login in verification failed",
                           new ErrorDetails("INVALID_TOKEN", "Unable to verify Authentication Token")
                   ));
       }catch (Exception e){
           return ResponseEntity
                   .status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(new ApiResponse(
                           false,
                           "Internal server error",
                           new ErrorDetails("SERVER_ERROR", e.getMessage())
                   ));
       }

       }

}
