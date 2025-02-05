package com.casino.drawn.Controller.UserProfile;

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
@CrossOrigin(origins = "http://localhost:5173")
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

        boolean isValid = loginService.verifyConnectSignature(request);

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        String token = jwtUtil.generateToken(request.getWalletAddress());
        userWalletService.verifyUserOrCreate(request.getWalletAddress());
        loginService.logUserLogin(request.getWalletAddress());
        System.out.println("Here");
        return ResponseEntity.ok(new AuthResponse(token));


    }

    @GetMapping("/auth/verify")
    public ResponseEntity<?> verifyWalletLogin(@RequestHeader("Authorization") String token) {

        if (jwtUtil.validateToken(token) != null) {
            return ResponseEntity.ok(new AuthResponse(token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid JWtoken");
    }
}
