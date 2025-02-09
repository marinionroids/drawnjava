package com.casino.drawn.Controller.UserProfile;

import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import com.casino.drawn.DTO.Coupon.CouponRequest;
import com.casino.drawn.Services.Coupon.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/auth/code")
    public ResponseEntity<?> activateCoupon(@RequestHeader("Authorization") String token, @RequestBody CouponRequest couponRequest) {
        ErrorDetails errorDetails = couponService.addCoupon(token, couponRequest);
        if (errorDetails.getCode().equals("INVALID_COUPON")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Invalid Code Provided",
                            errorDetails
                    ));
        }

        if (errorDetails.getCode().equals("COUPON_ALREADY_ACTIVATED")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "You have used this coupon already",
                            errorDetails
                    ));
        }

        if (errorDetails.getCode().equals("INVALID_TOKEN")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Invalit token",
                            errorDetails
                    ));
        }

        if (errorDetails.getCode().equals("CODE_ACTIVATION_SUCCESS")) {

            return ResponseEntity
                    .ok()
                    .body(new ApiResponse(
                            true,
                            "Coupon has been activated successfully",
                            errorDetails
                    ));
        }



        return ResponseEntity
                .badRequest()
                .body(new ApiResponse(
                        false,
                        "Something went wrong!",
                        new ErrorDetails("BAD_REQUEST", "There was an issue with your request!")));
    }

}
