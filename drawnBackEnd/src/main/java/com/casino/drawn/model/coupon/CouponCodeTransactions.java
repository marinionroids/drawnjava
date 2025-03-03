package com.casino.drawn.model.coupon;


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
@AllArgsConstructor
@NoArgsConstructor
public class CouponCodeTransactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "coupon_id")
    private CouponCode couponCode;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private Timestamp dateActivated;
}
