package com.casino.drawn.Model;

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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;
    private String username;
    private String primaryWalletAddress;
    private String recieverAddress;

    @Column(columnDefinition = "float default 0.0")
    private Float balance = 0.0f;

    private Timestamp created;
    private Timestamp lastLogin;

    private float  totalWager;
    private float totalDeposit;
    private float totalWithdraw;


}
