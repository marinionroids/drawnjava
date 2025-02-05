package com.casino.drawn.Model.Lootbox;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lootbox_items")
public class LootboxItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "lootbox_id")
    private Lootbox lootbox;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;


    private Float dropRate;

}
