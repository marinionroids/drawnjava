package com.casino.drawn.Services.Solana;


import com.casino.drawn.DTO.Solana.SolanaTransactionRequest;
import com.casino.drawn.Model.Solana.DepositTransactions;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Solana.DepositTransactionsRepository;
import com.casino.drawn.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Service
public class DepositTransactionService {

    private final UserRepository userRepository;
    private final SolanaService solanaService;
    private final DepositTransactionsRepository depositTransactionsRepository;

    public DepositTransactionService(UserRepository userRepository, SolanaService solanaService, DepositTransactionsRepository depositTransactionsRepository) {
        this.userRepository = userRepository;
        this.solanaService = solanaService;
        this.depositTransactionsRepository = depositTransactionsRepository;
    }

    public boolean verifyDeposit(SolanaTransactionRequest solanaTransactionRequest) {
        String SOLANA_DEVNET_URL = "https://api.devnet.solana.com";
        float lamportsPerSol = 1000000000f;

        RestTemplate restTemplate = new RestTemplate();
        Map<String,Object> requestBody = Map.of(
                "jsonrpc", "2.0",
                "id", "1",
                "method", "getTransaction",
                "params", List.of(solanaTransactionRequest.getSignature(), "json")
        );

        int count = 0;
        int maxTries = 3;

        ResponseEntity<Map> response;
        while(true){
            try{
                response = restTemplate.postForEntity(SOLANA_DEVNET_URL, requestBody, Map.class);
                if (response.getBody().get("result") == null){
                    return false;
                }
                else {break;}

            } catch (Exception e) {
                if(++count == maxTries) throw e;
            }
        }

        Map result = (Map) response.getBody().get("result");
        // Meta is the section where all the info we need is.
        Map meta = (Map) result.get("meta");
        Map transaction = (Map) result.get("transaction");
        Map message = (Map) transaction.get("message");

        List<String> accountKeys = (List<String>) message.get("accountKeys");
        List<Long> preBalances = (List<Long>) meta.get("preBalances");
        List<Long> postBalances = (List<Long>) meta.get("postBalances");
        Long preBalance = ((Number) preBalances.get(0)).longValue();
        Long postBalance = ((Number) postBalances.get(0)).longValue();

        float primaryAmount = ((preBalance - postBalance) / lamportsPerSol) - 0.000024f;
        float amount1 = solanaTransactionRequest.getAmount();

        String recieverWalletAddress = accountKeys.get(1);

        boolean finalResult = (Math.abs(primaryAmount - amount1) <= 0.0002f || Math.abs(amount1 - primaryAmount) <= 0.0002f) && recieverWalletAddress.equals(solanaTransactionRequest.getRecieverWalletAddress());

        if(finalResult){
            // Update user's balance and totalDeposit
            User user = userRepository.findByRecieverAddress(solanaTransactionRequest.getRecieverWalletAddress());
            Float depositAmount = solanaTransactionRequest.getAmount() * solanaService.getSolanaPrice();
            user.setTotalDeposit(user.getTotalDeposit() + depositAmount);
            user.setBalance(user.getBalance() + depositAmount);
            userRepository.save(user);

            // Logs user's deposit
            DepositTransactions depositData = new DepositTransactions();
            depositData.setUser(user);
            depositData.setAmount(solanaTransactionRequest.getAmount());
            depositData.setSignature(solanaTransactionRequest.getSignature());
            depositData.setSendingWalletAddress(solanaTransactionRequest.getSendingWalletAddress());
            depositData.setRecieverWalletAddress(solanaTransactionRequest.getRecieverWalletAddress());
            depositData.setDepositDate(new Timestamp(System.currentTimeMillis()));
            depositTransactionsRepository.save(depositData);

        }



        System.out.println(finalResult);
        return finalResult;
        // Check whether the frontEnd amount is the same by checking if its within a 0.04$ difference and checks whether all the addresses equal out or not.

    }
}
