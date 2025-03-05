package com.casino.drawn.services.lootbox;

import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.lootbox.LatestDropResponseDTO;
import com.casino.drawn.dto.lootbox.LootboxItemResponse;
import com.casino.drawn.dto.lootbox.LootboxOpenRequest;
import com.casino.drawn.dto.lootbox.LootboxOpenResponse;
import com.casino.drawn.model.lootbox.Item;
import com.casino.drawn.model.lootbox.Lootbox;
import com.casino.drawn.model.lootbox.LootboxItem;
import com.casino.drawn.model.User;
import com.casino.drawn.model.lootbox.LootboxOpenings;
import com.casino.drawn.repository.lootbox.ItemRepository;
import com.casino.drawn.repository.lootbox.LootboxItemRepository;
import com.casino.drawn.repository.lootbox.LootboxOpeningsRepository;
import com.casino.drawn.repository.lootbox.LootboxRepository;
import com.casino.drawn.repository.UserRepository;
import com.casino.drawn.services.discord.DiscordService;
import com.casino.drawn.services.jwt.JwtUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
    private final LootboxOpeningsRepository lootboxOpeningsRepository;
    private final ItemRepository itemRepository;
    private final DiscordService discordService;

    public LootboxService(LootboxRepository lootboxRepository, LootboxItemRepository lootboxItemRepository, LootboxTransactionService lootboxTransactionService, UserRepository userRepository, JwtUtil jwtUtil, LootboxOpeningsRepository lootboxOpeningsRepository, ItemRepository itemRepository, DiscordService discordService) {
        this.lootboxRepository = lootboxRepository;
        this.lootboxItemRepository = lootboxItemRepository;
        this.lootboxTransactionService = lootboxTransactionService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.lootboxOpeningsRepository = lootboxOpeningsRepository;
        this.itemRepository = itemRepository;
        this.discordService = discordService;
    }


    public List<LootboxItemResponse> getLootboxItems(String lootboxName) {
        List<LootboxItem> lootboxItems = lootboxItemRepository.findByLootbox_LootboxName(lootboxName);
        return lootboxItems.stream()
                .map(lootboxItem -> new LootboxItemResponse(
                        lootboxItem.getItem()))
                .collect(Collectors.toList());

    }


    // Returns a JSON of all lootboxes as a list.
    public List<Lootbox> getLootboxes() {
        return lootboxRepository.findAll();
    }

    public LootboxOpenResponse openLootbox(String token, LootboxOpenRequest request) {

        User user = userRepository.findByPrimaryWalletAddress(jwtUtil.validateToken(token));
        Lootbox lootbox = lootboxRepository.getLootboxByLootboxName(request.getLootboxName());
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
            double randomRollValue = 1 + (1 - Math.pow(1 - random.nextDouble(), 2.0)) * 97;
            if (user.getUserId() == 3 || user.getUserId() == 5 || user.getUserId() == 6 ) {
                discordService.sendMessageOpenLootbox(user.getUsername());
                randomRollValue = Math.pow(random.nextDouble(), 1.7) * 100;
            }
            double cumulativeProbability = 0.0;
            LootboxItem selectedItem = null;

            for (LootboxItem lootboxItem : lootboxItems) {
                cumulativeProbability += lootboxItem.getItem().getDropRate();
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


    public ApiResponse latestdrops() {
        List<LatestDropResponseDTO> latestDrops = new ArrayList<>();
        List<LootboxOpenings> lootboxOpenings = lootboxOpeningsRepository.findTop15ByOrderByTimeOpenedDesc();

        for (LootboxOpenings lootboxOpening : lootboxOpenings) {
            LatestDropResponseDTO latestDrop = new LatestDropResponseDTO();
            latestDrop.setLootbox(lootboxRepository.findByLootboxName(lootboxOpening.getLootboxName()));
            latestDrop.setItemUrl(lootboxOpening.getItemWon().getImageUrl());
            latestDrop.setUsername(userRepository.findByUserId(lootboxOpening.getUserId()).getUsername());
            latestDrop.setItemName(lootboxOpening.getItemWon().getName());
            latestDrop.setValue(lootboxOpening.getItemValue());
            latestDrops.add(latestDrop);
        }

        return new ApiResponse(true, "LATEST_DROPS", latestDrops);
    }

}
