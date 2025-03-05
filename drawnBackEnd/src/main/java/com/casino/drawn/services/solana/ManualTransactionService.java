package com.casino.drawn.services.solana;


import com.casino.drawn.dto.solana.ManualTransactions;
import com.casino.drawn.dto.solana.SolanaTransactionRequest;
import com.casino.drawn.model.solana.SecretKeyPair;
import com.casino.drawn.repository.UserRepository;
import com.casino.drawn.repository.solana.DepositTransactionsRepository;
import com.casino.drawn.repository.solana.SecretKeyPairRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ManualTransactionService {

    private final SecretKeyPairRepository secretKeyPairRepository;
    private final DepositTransactionsRepository depositTransactionsRepository;
    private final DepositTransactionService depositTransactionService;
    private final UserRepository userRepository;

    public ManualTransactionService(SecretKeyPairRepository secretKeyPairRepository, DepositTransactionsRepository depositTransactionsRepository, DepositTransactionService depositTransactionService, UserRepository userRepository) {
        this.secretKeyPairRepository = secretKeyPairRepository;
        this.depositTransactionsRepository = depositTransactionsRepository;
        this.depositTransactionService = depositTransactionService;
        this.userRepository = userRepository;
    }

    private ManualTransactions extractTransactionDetails(String signature, Map<String, Object> transactionData) {
        ManualTransactions transaction = new ManualTransactions();
        transaction.setSignature(signature);

        Map<String,Object> transactionObj = (Map<String , Object>) transactionData.get("transaction");
        Map<String, Object> message = (Map<String, Object>) transactionObj.get("message");
        List<String> accountKeys = (List<String>) message.get("accountKeys");

        transaction.setFromAddress(accountKeys.get(0));
        transaction.setToAddress(accountKeys.get(1));

        // Calculate amount

        Map<String, Object> meta = (Map<String, Object>) transactionData.get("meta");
        List<Number> preBalances = (List<Number>) meta.get("preBalances");
        List<Number> postBalances = (List<Number>) meta.get("postBalances");

        // Calculate the transferred amount (excluding fees)
        long fromPreBalance = preBalances.get(0).longValue();
        long fromPostBalance = postBalances.get(0).longValue();
        long toPreBalance = preBalances.get(1).longValue();
        long toPostBalance = postBalances.get(1).longValue();

        // Calculate fee

        // The amount is the increase in the recipient's balance
        // Converting from lamports to SOL (1 SOL = 1,000,000,000 lamports)
        long lamportsTransferred = toPostBalance - toPreBalance;
        float solTransferred = lamportsTransferred / 1_000_000_000.0f;
        transaction.setAmount(solTransferred);

        return transaction;

    }

    private List<ManualTransactions> getNewTransactions(SecretKeyPair secretKeyPair) {

        List<ManualTransactions> transactions = new ArrayList<>();
        String SOLANA_MAINNET_URL = "https://solana-mainnet.core.chainstack.com/34501e83ff7f1277b3792422179b8598";
        RestTemplate restTemplate = new RestTemplate();

        Map<String,Object> requestBody = Map.of(
                "jsonrpc", "2.0",
                "id", "1",
                "method", "getSignaturesForAddress",
                "params", List.of(secretKeyPair.getPublicKey())
        );

        int count = 0;
        int maxTries = 3;

        ResponseEntity<Map> response;
        while(true){
            try{
                try {
                    Thread.sleep(500); // Sleep for 3 seconds
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }

                response = restTemplate.postForEntity(SOLANA_MAINNET_URL, requestBody, Map.class);
                if (response.getBody().get("result") == null){
                    return null;
                }
                else {break;}

            } catch (Exception e) {
                if(++count == maxTries) throw e;
            }
        }


        if (response.getBody().get("result") instanceof List<?>) {
            List<?> results = (List<?>) response.getBody().get("result");

            for (Object result : results) {
                if (result instanceof Map) {
                    Map<?, ?> transactionInfo = (Map<?, ?>) result;
                    String signature = (String) transactionInfo.get("signature");


                    Map<String, Object> transactionRequestBody = new HashMap<>();
                    transactionRequestBody.put("jsonrpc", "2.0");
                    transactionRequestBody.put("id", 1);
                    transactionRequestBody.put("method", "getTransaction");

                    List<Object> params = new ArrayList<>();
                    params.add(signature);

                    // Add configuration options
                    Map<String, Object> configOptions = new HashMap<>();
                    configOptions.put("encoding", "json");
                    configOptions.put("maxSupportedTransactionVersion", 0);
                    params.add(configOptions);

                    transactionRequestBody.put("params", params);

                    try {
                        Thread.sleep(500); // Sleep for 3 seconds
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }

                    ResponseEntity<Map> transactionResponse = null;
                    int count1 = 0;
                    int maxTries1 = 3;

                    while (true) {
                        try {
                            transactionResponse = restTemplate.postForEntity(
                                    SOLANA_MAINNET_URL,
                                    transactionRequestBody,
                                    Map.class
                            );

                            if (transactionResponse.getBody() != null &&
                                    transactionResponse.getBody().get("result") != null) {
                                break;
                            } else {
                                if (++count1 == maxTries1) {
                                    System.out.println("Max tries reached for signature: " + signature);
                                    break;
                                }

                            }
                        } catch (Exception e) {
                            if (++count1 == maxTries1) {
                                System.out.println("Error processing signature: " + signature + ", " + e.getMessage());
                                break;
                            }
                        }
                    }


                    if (
                            transactionResponse.getBody() != null &&
                            transactionResponse.getBody().get("result") != null) {

                        ManualTransactions transaction = extractTransactionDetails(
                                signature,
                                (Map<String, Object>) transactionResponse.getBody().get("result")
                        );

                        if (transaction != null) {
                            transactions.add(transaction);
                        }
                    }

                }
            }
        }
        return transactions;

    }

    @Scheduled(fixedRate = 35000)
    public void checkManualDeposit(){
        List<SecretKeyPair> secretKeyPairs = secretKeyPairRepository.findAll();

        for (SecretKeyPair secretKeyPair : secretKeyPairs) {
            List<ManualTransactions> transactions = getNewTransactions(secretKeyPair);
            for (ManualTransactions transaction : transactions) {
                if (!depositTransactionsRepository.existsBySignature(transaction.getSignature()) && userRepository.existsByRecieverAddress(transaction.getToAddress())){
                    boolean response = depositTransactionService.verifyDeposit(new SolanaTransactionRequest(transaction.getFromAddress(), transaction.getToAddress(), transaction.getAmount(), transaction.getSignature()));
                    if (response) {
                        System.out.println("New manual deposit successful");
                    }

                }
            }

        }


    }
}
