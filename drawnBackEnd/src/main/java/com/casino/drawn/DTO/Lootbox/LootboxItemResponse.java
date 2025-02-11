package com.casino.drawn.DTO.Lootbox;


import com.casino.drawn.Model.Lootbox.Item;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LootboxItemResponse {

    private int itemId;
    private String name;
    private float price;
    private String imageUrl;
    private float dropRate;

    public LootboxItemResponse(Item item) {
        this.itemId = item.getId();
        this.name = item.getName();
        this.price = item.getPrice();
        this.imageUrl = item.getImageUrl();
        this.dropRate = item.getDropRate();
    }

}



