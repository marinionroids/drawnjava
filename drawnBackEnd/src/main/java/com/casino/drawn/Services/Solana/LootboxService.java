package com.casino.drawn.Services.Solana;

import com.casino.drawn.DTO.Lootbox.LootboxOpenRequest;
import com.casino.drawn.Model.Lootbox.Item;
import com.casino.drawn.Model.Lootbox.Lootbox;
import com.casino.drawn.Model.Lootbox.LootboxItem;
import com.casino.drawn.Repository.Lootbox.LootboxItemRepository;
import com.casino.drawn.Repository.Lootbox.LootboxRepository;
import com.casino.drawn.Services.Lootbox.LootboxTransactionService;
import com.casino.drawn.Services.Profile.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;

import java.util.Map;
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


    public List<Item> getLootboxItems(Integer lootboxId) {
        List<LootboxItem> lootboxItems = lootboxItemRepository.findByLootboxId(lootboxId);

        return lootboxItems.stream()
                .map(LootboxItem::getItem)
                .collect(Collectors.toList());
    }

    public List<Lootbox> getLootboxes() {
        return lootboxRepository.findAll();
    }

    public Map<String, Object> openLootbox(Integer lootboxId) {
        List<LootboxItem> lootboxItems = lootboxItemRepository.findByLootboxId(lootboxId);
        if (lootboxItems.isEmpty()) {
            throw new RuntimeException("Lootbox is empty or not found");
        }

        // Roll logic
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
            Map<String, Object> response = new HashMap<>();
            response.put("selectedItem", item);
            response.put("rollValue", randomRollValue);
            return response;
        }

        throw new RuntimeException("Error while opening lootbox.");
    }


    public Map<String, Object> purchaseAndOpenLootbox(Integer lootboxId, Integer userId, LootboxOpenRequest request) {
        Lootbox lootbox = lootboxRepository.findById(lootboxId).orElseThrow(() -> new RuntimeException("Lootbox not found"));

        userService.deductBalance(userId, lootbox.getPrice()); // First it deducts the user's balance.

        Map<String, Object> result = openLootbox(lootboxId);

        Item wonItem = (Item) result.get("selectedItem");
        userService.addWonItemValueToBalance(userId, wonItem.getPrice()); // Adds the item value to the user's balance.
        lootboxTransactionService.storeLootboxOpenings(wonItem, request);  //  Stores Opening Data to Database.
        return result;
    }




}
