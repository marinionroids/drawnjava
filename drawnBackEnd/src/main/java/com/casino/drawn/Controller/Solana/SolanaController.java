package com.casino.drawn.Controller.Solana;


import com.casino.drawn.DTO.ApiResponse;
import com.casino.drawn.DTO.DepositDetails;
import com.casino.drawn.DTO.ErrorDetails;
import com.casino.drawn.DTO.Solana.SolanaTransactionRequest;
import com.casino.drawn.Repository.Solana.DepositTransactionsRepository;
import com.casino.drawn.Services.Solana.DepositTransactionService;
import com.casino.drawn.Services.JWT.JwtUtil;
import com.casino.drawn.Services.Profile.LoginService;
import com.casino.drawn.Services.Profile.UserWalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SolanaController {


    private final JwtUtil jwtUtil;
    private final DepositTransactionsRepository depositTransactionsRepository;
    private final DepositTransactionService depositTransactionService;



    public SolanaController(JwtUtil jwtUtil, DepositTransactionsRepository depositTransactionsRepository, DepositTransactionService depositTransactionService, LoginService loginService, UserWalletService userWalletService) {
        this.jwtUtil = jwtUtil;
        this.depositTransactionsRepository = depositTransactionsRepository;
        this.depositTransactionService = depositTransactionService;

    }


    @PostMapping("/auth/deposit")
    public ResponseEntity<ApiResponse> validateDeposit(@RequestHeader("Authorization") String token,
                                                       @RequestBody SolanaTransactionRequest solanaTransactionRequest) {
        try {
            // Check for repeated signature
            if (depositTransactionsRepository.existsBySignature(solanaTransactionRequest.getSignature())) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(new ApiResponse(
                                false,
                                "Transaction signature already exists",
                                new ErrorDetails("DUPLICATE_SIGNATURE", "This transaction has already been processed")
                        ));
            }

            // Validate JWT token
            if (jwtUtil.validateToken(token) == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(
                                false,
                                "Authentication failed",
                                new ErrorDetails("INVALID_TOKEN", "Invalid or expired authentication token")
                        ));
            }

            // Verify deposit
            if (depositTransactionService.verifyDeposit(solanaTransactionRequest)) {
                return ResponseEntity
                        .ok()
                        .body(new ApiResponse(
                                true,
                                "Deposit processed successfully",
                                new DepositDetails(
                                        solanaTransactionRequest.getSignature(),
                                        solanaTransactionRequest.getAmount(),
                                        new Timestamp(System.currentTimeMillis())
                                )
                        ));
            }

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(
                            false,
                            "Deposit verification failed",
                            new ErrorDetails("INVALID_DEPOSIT", "Unable to verify the deposit transaction")
                    ));

        } catch (Exception e) {
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
