package com.casino.drawn.controller.solana;


import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.lootbox.DepositDetails;
import com.casino.drawn.dto.api.ErrorDetails;
import com.casino.drawn.dto.solana.SolanaTransactionRequest;
import com.casino.drawn.repository.solana.DepositTransactionsRepository;
import com.casino.drawn.services.solana.DepositTransactionService;
import com.casino.drawn.services.jwt.JwtUtil;
import com.casino.drawn.services.profile.LoginService;
import com.casino.drawn.services.profile.UserWalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;


@RestController
@RequestMapping("/api")

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
                            new ErrorDetails("SERVER_ERROR", "An error has occurred")
                    ));
        }
    }

}
