package com.casino.drawn.DTO.Lootbox;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LootboxOpenRequest {

    private String transactionId;
    private int lootboxId;
    private String recievingWalletAddress;



}
