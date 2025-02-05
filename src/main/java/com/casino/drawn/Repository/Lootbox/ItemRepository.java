package com.casino.drawn.Repository.Lootbox;


import com.casino.drawn.Model.Lootbox.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

@RestController
public interface ItemRepository extends JpaRepository<Item, Integer> {
    Item getItemById(int lootboxId);
}
