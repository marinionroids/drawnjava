package com.casino.drawn.Services.Lootbox;

import com.casino.drawn.DTO.Lootbox.LootboxOpenRequest;
import com.casino.drawn.Model.Lootbox.Item;
import com.casino.drawn.Model.Lootbox.LootboxOpenings;
import com.casino.drawn.Repository.Lootbox.LootboxOpeningsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Date;

@Service
public class LootboxTransactionService {

    @Autowired
    private LootboxOpeningsRepository lootboxOpeningsRepository;


    public void storeLootboxOpenings(Item item, LootboxOpenRequest lootboxOpenRequest) {

        LootboxOpenings lootboxOpenings = new LootboxOpenings();

        Timestamp timestamp = new Timestamp(new Date().getTime());

        lootboxOpenings.setItemValue(item.getPrice());
        lootboxOpenings.setItemWon(item.getName());
        lootboxOpenings.setLootboxId(lootboxOpenRequest.getLootboxId());
        lootboxOpenings.setTransactionId(lootboxOpenRequest.getTransactionId());
        lootboxOpenings.setTimeOpened(timestamp);
        lootboxOpenings.setUserId(lootboxOpenRequest.getUserId());
        lootboxOpeningsRepository.save(lootboxOpenings);

    }


}
