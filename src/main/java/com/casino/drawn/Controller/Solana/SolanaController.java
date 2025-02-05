package com.casino.drawn.Controller.Solana;


import com.casino.drawn.DTO.Solana.SolanaTransactionRequest;
import com.casino.drawn.Repository.Solana.DepositTransactionsRepository;
import com.casino.drawn.Services.Solana.DepositTransactionService;
import com.casino.drawn.Services.JWT.JwtUtil;
import com.casino.drawn.Services.Profile.LoginService;
import com.casino.drawn.Services.Profile.UserWalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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
    public ResponseEntity validateDeposit(@RequestHeader("Authorization") String token,
                                          @RequestBody SolanaTransactionRequest solanaTransactionRequest){
        if (depositTransactionsRepository.existsBySignature(solanaTransactionRequest.getSignature())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Repeated signature");  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BLOCK USER BECAUSE THEY ARE SENDING CUSTOM API REQUESTS. !!!!!!!!!!!!!!!!!!
        }
        if (jwtUtil.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid JWtoken");
        }

        if (depositTransactionService.verifyDeposit(solanaTransactionRequest)) {   // get userId from the front.
            return ResponseEntity.ok("Successfully deposited");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Deposit.");
    }

}
