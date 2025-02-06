package com.casino.drawn.Services.Solana;


import com.casino.drawn.Model.Solana.SecretKeyPair;
import com.casino.drawn.Repository.Solana.SecretKeyPairRepository;
import org.p2p.solanaj.core.Account;
import org.p2p.solanaj.rpc.RpcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SolanaService {

    private final SecretKeyPairRepository secretKeyPairRepository;

    public SolanaService(SecretKeyPairRepository secretKeyPairRepository) {
        this.secretKeyPairRepository = secretKeyPairRepository;
    }



    // Get latest Solana Price fron CoinGecko API.
    public float getSolanaPrice() {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
        Map response = restTemplate.getForObject(url, Map.class);
        return ((Map<String, Double>) response.get("solana")).get("usd").floatValue();
    }

    // Creates a new Solana Wallet that is going to be issued to a new user. Also stores the newly created wallet in the database.
    public SecretKeyPair createRecieverWallet() {

        SecretKeyPair secretKeyPair = new SecretKeyPair();
        new RpcClient("http://api.devnet.solana.com");
        Account account = new Account();
        String recieverPublicKey = account.getPublicKey().toBase58();
        byte[] recieverPrivateKey = account.getSecretKey();
        secretKeyPair.setPrivateKey(recieverPrivateKey);
        secretKeyPair.setPublicKey(recieverPublicKey);
        secretKeyPairRepository.save(secretKeyPair);
        return secretKeyPair;

    }
}
