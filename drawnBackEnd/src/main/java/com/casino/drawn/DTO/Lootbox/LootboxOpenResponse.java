package com.casino.drawn.DTO.Lootbox;

import com.casino.drawn.Model.Lootbox.Item;
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
