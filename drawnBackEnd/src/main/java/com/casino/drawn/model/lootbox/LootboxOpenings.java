package com.casino.drawn.model.lootbox;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lootbox_openings")
public class LootboxOpenings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int userId;
    private String lootboxName;

    @ManyToOne
    @JoinColumn(name = "item_won_id")
    private Item itemWon;

    private float itemValue;
    private String transactionId;
    private Timestamp timeOpened;


}
