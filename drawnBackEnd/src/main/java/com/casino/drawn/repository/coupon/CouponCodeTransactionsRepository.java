package com.casino.drawn.repository.coupon;

import com.casino.drawn.model.coupon.CouponCodeTransactions;
import com.casino.drawn.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponCodeTransactionsRepository extends JpaRepository<CouponCodeTransactions, Integer> {
    List<CouponCodeTransactions> findByUser(User user);
}
