package com.casino.drawn.Services.Profile;


import com.casino.drawn.Model.Solana.SecretKeyPair;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Solana.SecretKeyPairRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.Solana.SolanaService;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.UUID;

@Service
public class UserWalletService {

    private final UserRepository userRepository;
    private final SecretKeyPairRepository secretKeyPairRepository;
    private final SolanaService solanaService;

    public UserWalletService(UserRepository userRepository, SecretKeyPairRepository secretKeyPairRepository, SolanaService solanaService) {
        this.userRepository = userRepository;
        this.secretKeyPairRepository = secretKeyPairRepository;
        this.solanaService = solanaService;
    }



    // Verifies if a user exists or creates him.
    public void verifyUserOrCreate(String walletAddress) {

        if(!userRepository.existsByPrimaryWalletAddress(walletAddress)){
            User user = new User();
            SecretKeyPair newRecieverWallet = solanaService.createRecieverWallet();
            Timestamp timestamp = new Timestamp(System.currentTimeMillis());
            user.setCreated(timestamp);
            user.setLastLogin(timestamp);
            user.setPrimaryWalletAddress(walletAddress);
            user.setUsername(UUID.randomUUID().toString().replace("-", "").substring(0,10));
            user.setRecieverAddress(newRecieverWallet.getPublicKey());
            userRepository.save(user);
            newRecieverWallet.setUser(user);
            secretKeyPairRepository.save(newRecieverWallet);
        }
    }

}
