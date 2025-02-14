package com.casino.drawn.Services.Solana;


import com.casino.drawn.DTO.Solana.WithdrawRequest;
import com.casino.drawn.DTO.Solana.WithdrawResponse;
import com.casino.drawn.Model.Solana.SecretKeyPair;
import com.casino.drawn.Model.Solana.WithdrawTransaction;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Solana.SecretKeyPairRepository;
import com.casino.drawn.Repository.Solana.WithdrawTransactionsRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.JWT.JwtUtil;
import org.p2p.solanaj.core.Account;
import org.p2p.solanaj.core.PublicKey;
import org.p2p.solanaj.core.Transaction;
import org.p2p.solanaj.programs.SystemProgram;
import org.p2p.solanaj.rpc.*;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;


@Service
public class WithdrawService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final SolanaService solanaService;
    private final WithdrawTransactionsRepository withdrawTransactionsRepository;

    public WithdrawService(JwtUtil jwtUtil, UserRepository userRepository, SecretKeyPairRepository secretKeyPairRepository, SolanaService solanaService, WithdrawTransactionsRepository withdrawTransactionsRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.solanaService = solanaService;
        this.withdrawTransactionsRepository = withdrawTransactionsRepository;
    }

    public WithdrawResponse handleWithdraw(String token, WithdrawRequest request) throws RpcException {

        // Verify user has valid balance and make sure they have wagered 1x their total deposit.
        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        if (user.getBalance() > request.getAmountInUSD()){
            if (user.getTotalDeposit() > user.getTotalWager()){
                float wagerNeeded = user.getTotalDeposit() - user.getTotalWager();
                return new WithdrawResponse("WAGER_AMOUNT_NOT_MET", "You will need to wager $" + wagerNeeded  + "USD in order to withdraw.");
            }
            // Create Solana Transaction.
            byte[] privateKeyBytes = new byte[] {
                    (byte)134, (byte)2, (byte)241, (byte)204, (byte)117, (byte)55, (byte)253, (byte)164, (byte)175, (byte)129, (byte)43, (byte)2, (byte)243, (byte)71, (byte)167, (byte)177,
                    (byte)154, (byte)160, (byte)145, (byte)187, (byte)106, (byte)54, (byte)34, (byte)226, (byte)249, (byte)115, (byte)5, (byte)132, (byte)211, (byte)105, (byte)55, (byte)134,
                    (byte)100, (byte)56, (byte)5, (byte)86, (byte)127, (byte)152, (byte)216, (byte)46, (byte)115, (byte)166, (byte)226, (byte)93, (byte)131, (byte)168, (byte)10, (byte)144,
                    (byte)219, (byte)28, (byte)123, (byte)114, (byte)87, (byte)148, (byte)167, (byte)49, (byte)12, (byte)29, (byte)60, (byte)230, (byte)44, (byte)2, (byte)100, (byte)94
            };


            RpcClient client = new RpcClient(Cluster.DEVNET);
            PublicKey fromPublicKey = new PublicKey("7kDKGKw5ebKxKjxfLPmJHk827Gk3iukq6wM52VzLMUcu");
            PublicKey toPublicKey = new PublicKey(request.getToWallet());
            float currentSOLPriceinUSD = solanaService.getSolanaPrice();
            float SOLAmount = request.getAmountInUSD()/currentSOLPriceinUSD;
            float lamportsAmount = SOLAmount * 1000000000;
            Account signer = new Account(privateKeyBytes);
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
