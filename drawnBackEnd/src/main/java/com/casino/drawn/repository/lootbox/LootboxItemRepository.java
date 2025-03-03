package com.casino.drawn.Repository.Lootbox;

import com.casino.drawn.Model.Lootbox.LootboxItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LootboxItemRepository extends JpaRepository<LootboxItem, Integer> {
    List<LootboxItem> findByLootboxId(Integer lootboxId);
    List<LootboxItem> findByLootbox_LootboxName(String lootboxName);
}
