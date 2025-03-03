package com.casino.drawn.dto.userprofile;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private int userId;
    private String username;
    private float totalDeposit;
    private float totalWithdraw;
    private float totalWagered;
    private List<DepositTransactionDTO> depositTransactions;
    private List<WithdrawTransactionDTO> withdrawTransactions;
    private List<UserLootboxOpeningHistoryDTO> userLootboxOpeningHistory;

}