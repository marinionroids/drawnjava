package com.casino.drawn.repository.coupon;

import com.casino.drawn.model.coupon.CouponCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponCodeRepository extends JpaRepository<CouponCode, Integer> {
    CouponCode findByCode(String code);

}
