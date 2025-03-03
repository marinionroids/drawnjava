package com.casino.drawn.repository.lootbox;


import com.casino.drawn.model.lootbox.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

@RestController
public interface ItemRepository extends JpaRepository<Item, Integer> {

    Item getItemByName(String lootboxName);
}
