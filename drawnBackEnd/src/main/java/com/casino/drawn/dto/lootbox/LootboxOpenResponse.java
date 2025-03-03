package com.casino.drawn.dto.lootbox;

import com.casino.drawn.model.lootbox.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LootboxOpenResponse {
    private Item item;
    private double rollValue;
}
