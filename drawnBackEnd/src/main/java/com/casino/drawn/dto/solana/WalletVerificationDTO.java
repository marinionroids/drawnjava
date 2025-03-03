package com.casino.drawn.dto.solana;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WalletVerificationDTO {

    private String walletAddress;
    private String message;
    private String signature;


}
