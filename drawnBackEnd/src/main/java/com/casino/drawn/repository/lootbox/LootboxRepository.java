package com.casino.drawn.repository.lootbox;

import com.casino.drawn.model.lootbox.Lootbox;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LootboxRepository extends JpaRepository<Lootbox, Integer> {

    Lootbox getLootboxById(int id);
    Lootbox getLootboxByName(String name);
    Lootbox getLootboxByLootboxName(String lootboxName);
}
