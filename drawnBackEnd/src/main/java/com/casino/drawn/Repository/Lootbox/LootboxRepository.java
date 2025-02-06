package com.casino.drawn.Repository.Lootbox;

import com.casino.drawn.Model.Lootbox.Lootbox;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LootboxRepository extends JpaRepository<Lootbox, Integer> {
    Lootbox getLootboxById(int id);
}
