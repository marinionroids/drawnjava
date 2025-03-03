package com.casino.drawn.dto.userprofile;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private int userId;
    private String username;
    private String recievingAddress;
    private float balance;

}
