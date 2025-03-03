package com.casino.drawn.Services.Solana;


import com.casino.drawn.DTO.Solana.WithdrawRequest;
import com.casino.drawn.DTO.Solana.WithdrawResponse;
import com.casino.drawn.Model.Solana.WithdrawTransaction;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Solana.SecretKeyPairRepository;
import com.casino.drawn.Repository.Solana.WithdrawTransactionsRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.JWT.JwtUtil;
import org.springframework.beans.factory.annotation.Value;  // Add this import
import org.p2p.solanaj.core.Account;
import org.p2p.solanaj.core.PublicKey;
import org.p2p.solanaj.core.Transaction;
import org.p2p.solanaj.programs.SystemProgram;
import org.p2p.solanaj.rpc.*;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Base64;


@Service
public class WithdrawService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final SolanaService solanaService;
    private final WithdrawTransactionsRepository withdrawTransactionsRepository;
    @Value("${WITHDRAW_PRIVATE_KEY_BASE64}")
    private String encodedPrivateKey;
    @Value("${WITHDRAW_PUBLIC_KEY}")
    private String fromWalletPublicKey;

    public WithdrawService(JwtUtil jwtUtil, UserRepository userRepository, SecretKeyPairRepository secretKeyPairRepository, SolanaService solanaService, WithdrawTransactionsRepository withdrawTransactionsRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.solanaService = solanaService;
        this.withdrawTransactionsRepository = withdrawTransactionsRepository;
    }

    private byte[] getPrivateKeyBytes() {
        return Base64.getDecoder().decode(encodedPrivateKey);
    }

    private boolean validWithdrawBalance(float withdrawAmount) throws RpcException {

        RpcClient client = new RpcClient(Cluster.DEVNET);
        PublicKey withdrawPublicKey = new PublicKey(fromWalletPublicKey);
        // We get the casino's balance(lamports), turn it into SOL and then get the user request's amound(USD) turn that into SOL and compare.
        long balanceInLamports = client.getApi().getBalance(withdrawPublicKey);
        float balanceInSOL = (float) balanceInLamports / 1000000000;
        float withdrawAmountInSOL = withdrawAmount / solanaService.getSolanaPrice();
        return balanceInSOL > withdrawAmountInSOL;

    }

    public WithdrawResponse handleWithdraw(String token, WithdrawRequest request) throws RpcException {

        // Verify user has valid balance and make sure they have wagered 1x their total deposit (protection for money-laundering).
        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        if (user.getBalance() > request.getAmountInUSD()){
            if (user.getTotalDeposit() > user.getTotalWager()){
                float wagerNeeded = user.getTotalDeposit() - user.getTotalWager();
                return new WithdrawResponse("WAGER_AMOUNT_NOT_MET", "You will need to wager $" + wagerNeeded  + "USD in order to withdraw.");
            }

            // Checks whether the casino's address has enough funds.
            if (!validWithdrawBalance( request.getAmountInUSD())){
                return new WithdrawResponse("CONTACT_SUPPORT", "Not enough withdrawl funds, please contact support");
            }



            // Create Solana Transaction.

            RpcClient client = new RpcClient(Cluster.DEVNET);
            PublicKey fromPublicKey = new PublicKey(fromWalletPublicKey);
            PublicKey toPublicKey = new PublicKey(request.getToWallet());
            float currentSOLPriceinUSD = solanaService.getSolanaPrice();
            float SOLAmount = request.getAmountInUSD()/currentSOLPriceinUSD;
            float lamportsAmount = SOLAmount * 1000000000;
            Account signer = new Account(getPrivateKeyBytes());
            Transaction transaction = new Transaction();
            transaction.addInstruction(SystemProgram.transfer(fromPublicKey, toPublicKey, (long) lamportsAmount));

            String signature = client.getApi().sendTransaction(transaction, signer);


            // change the user details in the database and log the transaction!!
            if (signature != null) {
                WithdrawTransaction withdrawTransaction = new WithdrawTransaction();
                withdrawTransaction.setAmount(request.getAmountInUSD());
                withdrawTransaction.setFromAddress(fromPublicKey.toString());
                withdrawTransaction.setToAddress(request.getToWallet());
                withdrawTransaction.setTransactionDate(new Timestamp(System.currentTimeMillis()));
                withdrawTransaction.setUserId(user);
                withdrawTransaction.setSignature(signature);
                withdrawTransactionsRepository.save(withdrawTransaction);


                user.setBalance(user.getBalance() - request.getAmountInUSD());
                user.setTotalWithdraw(user.getTotalWithdraw() + request.getAmountInUSD());
                userRepository.save(user);
            }

            return new WithdrawResponse("WITHDRAW_SUCCESS", "Funds have been withdrawn.");
        }

        return new WithdrawResponse("NOT_ENOUGH_FUNDS", "You don't have enough funds to withdraw.");


    }
}
