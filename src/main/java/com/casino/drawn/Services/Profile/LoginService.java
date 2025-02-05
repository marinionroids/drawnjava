package com.casino.drawn.Services.Profile;


import com.casino.drawn.DTO.Solana.WalletVerificationDTO;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.UserRepository;
import org.sol4k.Base58;
import org.sol4k.PublicKey;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class LoginService {

    private final UserRepository userRepository;

    public LoginService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    // Verifies the SOLFLARE LOGIN CONNECTION.
    public boolean verifyConnectSignature(WalletVerificationDTO request){

        try {
            byte[] messageBytes = request.getMessage().getBytes();
            PublicKey publicKey = new PublicKey(request.getWalletAddress());
            byte[] signatureBytes = Base58.decode(request.getSignature());
            return publicKey.verify(signatureBytes,messageBytes);


        } catch (Exception e) {
            return false;
        }


    }

    public void logUserLogin(String walletAddress){
        // Logs the user last login by upating the database
        User user = userRepository.findByPrimaryWalletAddress(walletAddress);
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        user.setLastLogin(timestamp);
        userRepository.save(user);
    }
}
