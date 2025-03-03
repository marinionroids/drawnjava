package com.casino.drawn.services.lootbox;

import com.casino.drawn.dto.lootbox.LootboxOpenRequest;
import com.casino.drawn.model.lootbox.Item;
import com.casino.drawn.model.lootbox.LootboxOpenings;
import com.casino.drawn.model.User;
import com.casino.drawn.repository.lootbox.LootboxOpeningsRepository;
import com.casino.drawn.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Date;

@Service
public class LootboxTransactionService {

    @Autowired
    private LootboxOpeningsRepository lootboxOpeningsRepository;
    @Autowired
    private UserRepository userRepository;


    public void storeLootboxOpenings(Item item, LootboxOpenRequest lootboxOpenRequest) {

        LootboxOpenings lootboxOpenings = new LootboxOpenings();
        User user = userRepository.findByRecieverAddress(lootboxOpenRequest.getRecievingWalletAddress());
        Timestamp timestamp = new Timestamp(new Date().getTime());

        lootboxOpenings.setItemValue(item.getPrice());
        lootboxOpenings.setItemWon(item);
        lootboxOpenings.setLootboxName(lootboxOpenRequest.getLootboxName());
        lootboxOpenings.setTransactionId(lootboxOpenRequest.getTransactionId());
        lootboxOpenings.setTimeOpened(timestamp);
        lootboxOpenings.setUserId(user.getUserId());
        lootboxOpeningsRepository.save(lootboxOpenings);

    }


}
