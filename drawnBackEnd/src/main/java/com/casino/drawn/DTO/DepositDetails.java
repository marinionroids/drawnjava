package com.casino.drawn.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DepositDetails {

    private String transactionSignature;
    private float amount;
    private Timestamp timestamp;
}
