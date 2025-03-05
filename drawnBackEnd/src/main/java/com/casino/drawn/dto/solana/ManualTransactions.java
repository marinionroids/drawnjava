package com.casino.drawn.dto.solana;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ManualTransactions {

    private String signature;
    private String fromAddress;
    private String toAddress;
    private float amount;

}
