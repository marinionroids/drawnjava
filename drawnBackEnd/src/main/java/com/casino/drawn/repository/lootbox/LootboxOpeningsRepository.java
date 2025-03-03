package com.casino.drawn.repository.lootbox;

import com.casino.drawn.model.lootbox.LootboxOpenings;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LootboxOpeningsRepository extends JpaRepository<LootboxOpenings, Integer> {


    List<LootboxOpenings> findTop15ByOrderByTimeOpenedDesc();

    List<LootboxOpenings> findAllByUserId(int userId);
}
