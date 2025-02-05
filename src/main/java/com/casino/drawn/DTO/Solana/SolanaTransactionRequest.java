package com.casino.drawn.DTO.Solana;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SolanaTransactionRequest {
    private String sendingWalletAddress;
    private String recieverWalletAddress;
    private float amount;
    private String signature;

}
