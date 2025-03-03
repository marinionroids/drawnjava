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

public class UserLootboxOpeningHistoryDTO {

    private String transactionId;
    private String lootboxName;
    private float lootboxPrice;
    private float itemWonValue;
    private Timestamp timeOpened;

}
