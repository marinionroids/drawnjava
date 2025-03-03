package com.casino.drawn.services.coupon;

import com.casino.drawn.dto.api.ErrorDetails;
import com.casino.drawn.dto.coupon.CouponRequest;
import com.casino.drawn.model.coupon.CouponCode;
import com.casino.drawn.model.coupon.CouponCodeTransactions;
import com.casino.drawn.model.User;
import com.casino.drawn.repository.coupon.CouponCodeRepository;
import com.casino.drawn.repository.coupon.CouponCodeTransactionsRepository;
import com.casino.drawn.repository.UserRepository;
import com.casino.drawn.services.jwt.JwtUtil;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class CouponService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final CouponCodeRepository couponCodeRepository;
    private final CouponCodeTransactionsRepository couponCodeTransactionsRepository;

    public CouponService(UserRepository userRepository, JwtUtil jwtUtil, CouponCodeRepository couponCodeRepository, CouponCodeTransactionsRepository couponCodeTransactionsRepository) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.couponCodeRepository = couponCodeRepository;
        this.couponCodeTransactionsRepository = couponCodeTransactionsRepository;
    }

    public ErrorDetails addCoupon(String token, CouponRequest coupon) {

        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        CouponCode couponCode = couponCodeRepository.findByCode(coupon.getCode());
        List<CouponCodeTransactions> couponCodeTransactions = couponCodeTransactionsRepository.findByUser(user);
        // Validating user
        if (user == null){
            return new ErrorDetails("INVALID_TOKEN", "Invalid Authentication Token");
        }

        // Validating coupon
        if (couponCode == null) {
            return new ErrorDetails("INVALID_COUPON", "Invalid coupon code");
        }

        //Check whether user already used the code.
        boolean hasUsedCode = couponCodeTransactions.stream().anyMatch(transaction -> transaction.getCouponCode().equals(couponCode));
        if (!hasUsedCode) {
            // If user hasn't used the code yet, add the value of the code to user balance.
            couponCode.setActivationsLeft(couponCode.getActivationsLeft() - 1);
            couponCodeRepository.save(couponCode);
            user.setBalance(user.getBalance()+ couponCode.getValue());
            userRepository.save(user);

            // Log the usage of the code by this user.
            CouponCodeTransactions couponCodeTransaction = new CouponCodeTransactions();
            couponCodeTransaction.setUser(user);
            couponCodeTransaction.setCouponCode(couponCode);
            couponCodeTransaction.setDateActivated(new Timestamp(System.currentTimeMillis()));
            couponCodeTransactionsRepository.save(couponCodeTransaction);
            return new ErrorDetails("CODE_ACTIVATION_SUCCESS", "Coupon code activated successfully");
        }
        return new ErrorDetails("COUPON_ALREADY_ACTIVATED", "Coupon code already activated");


    }

}
