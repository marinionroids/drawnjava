package com.casino.drawn.Repository.Coupon;

import com.casino.drawn.Model.Coupon.CouponCodeTransactions;
import com.casino.drawn.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponCodeTransactionsRepository extends JpaRepository<CouponCodeTransactions, Integer> {
    List<CouponCodeTransactions> findByUser(User user);
}
