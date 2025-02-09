package com.casino.drawn.Services.Lootbox;

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

    @Autowired
    private LootboxRepository lootboxRepository;

    @Autowired
    private LootboxItemRepository lootboxItemRepository;

    @Autowired
    private LootboxTransactionService lootboxTransactionService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private LootboxOpeningsRepository lootboxOpeningsRepository;


    public List<Item> getLootboxItems(Integer lootboxId) {
        List<LootboxItem> lootboxItems = lootboxItemRepository.findByLootboxId(lootboxId);

        return lootboxItems.stream()
                .map(LootboxItem::getItem)
                .collect(Collectors.toList());
    }

    public List<Lootbox> getLootboxes() {
        return lootboxRepository.findAll();
    }

    public LootboxOpenResponse openLootbox(String token, LootboxOpenRequest request) {

        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        Lootbox lootbox = lootboxRepository.getLootboxById(request.getLootboxId());
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
