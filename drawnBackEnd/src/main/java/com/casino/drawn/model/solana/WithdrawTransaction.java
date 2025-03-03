package com.casino.drawn.model.solana;


import com.casino.drawn.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.sql.Timestamp;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private float amount;
    private String toAddress;
    private String fromAddress;
    private Timestamp transactionDate;
    private String signature;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userId;
}
