package com.casino.drawn.dto.userprofile;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawTransactionDTO {

    private int transactionId;
    private float amount;
    private Timestamp transactionDate;
    private String recieverAddress;


}
