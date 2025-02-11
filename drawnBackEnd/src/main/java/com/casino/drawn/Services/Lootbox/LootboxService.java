package com.casino.drawn.Services.Lootbox;

import com.casino.drawn.DTO.Lootbox.LootboxItemResponse;
import com.casino.drawn.DTO.Lootbox.LootboxOpenRequest;
import com.casino.drawn.DTO.Lootbox.LootboxOpenResponse;
import com.casino.drawn.Model.Lootbox.Item;
import com.casino.drawn.Model.Lootbox.Lootbox;
import com.casino.drawn.Model.Lootbox.LootboxItem;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Lootbox.LootboxItemRepository;
import com.casino.drawn.Repository.Lootbox.LootboxOpeningsRepository;
import com.casino.drawn.Repository.Lootbox.LootboxRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.JWT.JwtUtil;
import com.casino.drawn.Services.Profile.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import java.util.Random;
import java.util.stream.Collectors;

@Service
public class  LootboxService {

    private final LootboxRepository lootboxRepository;
    private final LootboxItemRepository lootboxItemRepository;
    private final LootboxTransactionService lootboxTransactionService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public LootboxService(LootboxRepository lootboxRepository, LootboxItemRepository lootboxItemRepository, LootboxTransactionService lootboxTransactionService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.lootboxRepository = lootboxRepository;
        this.lootboxItemRepository = lootboxItemRepository;
        this.lootboxTransactionService = lootboxTransactionService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }


    public List<LootboxItemResponse> getLootboxItems(String lootboxName) {
        List<LootboxItem> lootboxItems = lootboxItemRepository.findByLootboxName(lootboxName);

        return lootboxItems.stream()
                .map(lootboxItem -> new LootboxItemResponse(
                        lootboxItem.getItem(),
                        lootboxItem.getDropRate()))
                .collect(Collectors.toList());

    }


    // Returns a JSON of all lootboxes as a list.
    public List<Lootbox> getLootboxes() {
        return lootboxRepository.findAll();
    }

    public LootboxOpenResponse openLootbox(String token, LootboxOpenRequest request) {

        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        Lootbox lootbox = lootboxRepository.getLootboxByName(request.getLootboxName());
        System.out.println(lootbox.getName());
        if (user.getRecieverAddress().equals(request.getRecievingWalletAddress())) {
            // Check for sufficent balance and deduct.
            if (user.getBalance() >= lootbox.getPrice()) {
                user.setBalance(user.getBalance() - lootbox.getPrice());
            } else {
                return null;
            }

            // Open lootbox with randomized logic. !!!!!!!!!!!!  TRY implementing the PROVABLY FAIR SEED. !!!!!!!!!! FIX THIS
            // Open lootbox with randomized logic. !!!!!!!!!!!!  TRY implementing the PROVABLY FAIR SEED. !!!!!!!!!! FIX THIS
            // Open lootbox with randomized logic. !!!!!!!!!!!!  TRY implementing the PROVABLY FAIR SEED. !!!!!!!!!! FIX THIS
            List<LootboxItem> lootboxItems = lootboxItemRepository.findByLootboxId(lootbox.getId());
            Random random = new Random();
            double randomRollValue = random.nextDouble() * 100;
            double cumulativeProbability = 0.0;
            LootboxItem selectedItem = null;

            for (LootboxItem lootboxItem : lootboxItems) {
                cumulativeProbability += lootboxItem.getDropRate();
                if (cumulativeProbability >= randomRollValue) {
                    selectedItem = lootboxItem;
                    break;
                }
            }

            if (selectedItem != null) {
                Item item = selectedItem.getItem();
                // Updates the balance.
                user.setBalance(user.getBalance() + item.getPrice());
                // Updates the total wager amount.
                user.setTotalWager(user.getTotalWager() + lootbox.getPrice());
                userRepository.save(user);
                // Logs the lootbox opening transaction in the database.
                lootboxTransactionService.storeLootboxOpenings(item, request);
                return new LootboxOpenResponse(item, randomRollValue);
            }
        }

        return null;   //!!!!!!!!!!!!!!!!!!!!!!!!!! CHANGE THE API RESPONSES HERE ON THIS METHOD WITH PROPER DTORESPONSE/REQUEST
        //!!!!!!!!!!!!!!!!!!!!!!!!!! CHANGE THE API RESPONSES HERE ON THIS METHOD
        //!!!!!!!!!!!!!!!!!!!!!!!!!! CHANGE THE API RESPONSES HERE ON THIS METHOD
        //!!!!!!!!!!!!!!!!!!!!!!!!!! CHANGE THE API RESPONSES HERE ON THIS METHOD


    }

}
