package com.casino.drawn.Model.Solana;


import com.casino.drawn.Model.User;
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

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userId;
}
