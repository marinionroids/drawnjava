package com.casino.drawn.model.solana;


import com.casino.drawn.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "deposit_transactions")
public class DepositTransactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    private float amount;
    private String sendingWalletAddress;
    private String recieverWalletAddress;
    private Timestamp depositDate;
    private String signature;



}
