package com.casino.drawn.services.profile;

import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.userprofile.DepositTransactionDTO;
import com.casino.drawn.dto.userprofile.ProfileResponse;
import com.casino.drawn.dto.userprofile.UserLootboxOpeningHistoryDTO;
import com.casino.drawn.dto.userprofile.WithdrawTransactionDTO;
import com.casino.drawn.model.User;
import com.casino.drawn.model.lootbox.Lootbox;
import com.casino.drawn.model.lootbox.LootboxOpenings;
import com.casino.drawn.model.solana.DepositTransactions;
import com.casino.drawn.model.solana.WithdrawTransaction;
import com.casino.drawn.repository.UserRepository;
import com.casino.drawn.repository.lootbox.LootboxOpeningsRepository;
import com.casino.drawn.repository.lootbox.LootboxRepository;
import com.casino.drawn.repository.solana.DepositTransactionsRepository;
import com.casino.drawn.repository.solana.WithdrawTransactionsRepository;
import com.casino.drawn.services.jwt.JwtUtil;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final DepositTransactionsRepository depositTransactionsRepository;
    private final WithdrawTransactionsRepository withdrawTransactionsRepository;
    private final LootboxOpeningsRepository lootboxOpeningsRepository;
    private final LootboxRepository lootboxRepository;

    public ProfileService(UserRepository userRepository, JwtUtil jwtUtil, DepositTransactionsRepository depositTransactionsRepository, WithdrawTransactionsRepository withdrawTransactionsRepository, LootboxOpeningsRepository lootboxOpeningsRepository, LootboxRepository lootboxRepository) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.depositTransactionsRepository = depositTransactionsRepository;
        this.withdrawTransactionsRepository = withdrawTransactionsRepository;
        this.lootboxOpeningsRepository = lootboxOpeningsRepository;
        this.lootboxRepository = lootboxRepository;
    }

    private List<DepositTransactionDTO> getUserDepositTransactions(User user) {
        List<DepositTransactionDTO> depositTransactions = new ArrayList<>();
        List<DepositTransactions> deposits = depositTransactionsRepository.findAllByUser(user);
        for (DepositTransactions depositTransaction : deposits) {
            DepositTransactionDTO depositTransactionDTO = new DepositTransactionDTO(depositTransaction.getId(), depositTransaction.getAmount(), depositTransaction.getDepositDate());
            depositTransactions.add(depositTransactionDTO);
        }

        return depositTransactions;
    }

    private List<WithdrawTransactionDTO> getUserWithdrawTransactions(User user) {
        List<WithdrawTransactionDTO> withdrawTransactions = new ArrayList<>();
        List<WithdrawTransaction> withdrawls = withdrawTransactionsRepository.findAllByUserId(user);
        for (WithdrawTransaction withdrawTransaction : withdrawls) {
            WithdrawTransactionDTO withdrawTransactionDTO = new WithdrawTransactionDTO(withdrawTransaction.getId(), withdrawTransaction.getAmount(), withdrawTransaction.getTransactionDate(), withdrawTransaction.getToAddress());
            withdrawTransactions.add(withdrawTransactionDTO);
        }
        return withdrawTransactions;
    }

    private float getLootboxPriceByName(String lootboxName) {
        Lootbox lootbox = lootboxRepository.getLootboxByLootboxName(lootboxName);
        return lootbox.getPrice();
    }


    private List<UserLootboxOpeningHistoryDTO> getUserLootboxOpeningHistory(User user) {
        List<UserLootboxOpeningHistoryDTO> userLootboxOpeningHistories = new ArrayList<>();
        List<LootboxOpenings> openings = lootboxOpeningsRepository.findAllByUserId(user.getUserId());
        for (LootboxOpenings opening : openings) {
            UserLootboxOpeningHistoryDTO lootboxOpeningHistoryDTO = new UserLootboxOpeningHistoryDTO(opening.getTransactionId(), opening.getLootboxName(), getLootboxPriceByName(opening.getLootboxName()), opening.getItemValue(), opening.getTimeOpened());
            userLootboxOpeningHistories.add(lootboxOpeningHistoryDTO);
        }
        return userLootboxOpeningHistories;
    }

    public ApiResponse getProfileData(String token) {

        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        ProfileResponse profileResponse = new ProfileResponse();
        profileResponse.setUserId(user.getUserId());
        profileResponse.setUsername(user.getUsername());
        profileResponse.setTotalDeposit(user.getTotalDeposit());
        profileResponse.setTotalWithdraw(user.getTotalWithdraw());
        profileResponse.setTotalWagered(user.getTotalWager());
        profileResponse.setDepositTransactions(getUserDepositTransactions(user));
        profileResponse.setWithdrawTransactions(getUserWithdrawTransactions(user));
        profileResponse.setUserLootboxOpeningHistory(getUserLootboxOpeningHistory(user));

        return new ApiResponse(true, "Profile Data", profileResponse);


    }
}
