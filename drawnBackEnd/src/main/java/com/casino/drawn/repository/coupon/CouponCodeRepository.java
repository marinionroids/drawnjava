package com.casino.drawn.Repository.Coupon;

import com.casino.drawn.Model.Coupon.CouponCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponCodeRepository extends JpaRepository<CouponCode, Integer> {
    CouponCode findByCode(String code);

}
