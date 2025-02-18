package com.casino.drawn.Controller.Solana;


import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.Solana.WithdrawRequest;
import com.casino.drawn.DTO.Solana.WithdrawResponse;
import com.casino.drawn.Services.Solana.WithdrawService;
import org.p2p.solanaj.rpc.RpcException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://drawngg.com")
public class WithdrawController {

    private final WithdrawService withdrawService;

    public WithdrawController(WithdrawService withdrawService) {
        this.withdrawService = withdrawService;
    }

    @PostMapping("/auth/withdraw")
    public ResponseEntity<?> withdraw(@RequestHeader("Authorization") String token, @RequestBody WithdrawRequest withdrawRequest) throws RpcException {

        WithdrawResponse response = withdrawService.handleWithdraw(token, withdrawRequest);

        if (response.getCode() == "WAGER_AMOUNT_NOT_MET") {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Failed to withdraw",
                            response
                    ));
        }

        if (response.getCode() == "NOT_ENOUGH_FUNDS") {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Failed to withdraw",
                            response
                    ));
        }

        if (response.getCode() == "CONTACT_SUPPORT") {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Something went wrong!",
                            response
                    ));
        }

        return ResponseEntity
                .ok()
                .body(new ApiResponse(
                        true,
                        "Withdraw Successfully",
                        response
                ));
    }
}
