package com.casino.drawn.dto.lootbox;


import com.casino.drawn.model.lootbox.Lootbox;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LatestDropResponseDTO {

    private Lootbox lootbox;
    private String itemUrl;
    private String itemName;
    private String username;
    private float value;

}
