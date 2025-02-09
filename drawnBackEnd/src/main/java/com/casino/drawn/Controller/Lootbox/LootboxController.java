package com.casino.drawn.Controller.Lootbox;

import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import com.casino.drawn.DTO.Lootbox.LootboxOpenRequest;
import com.casino.drawn.Model.Lootbox.Item;
import com.casino.drawn.Model.Lootbox.Lootbox;
import com.casino.drawn.Repository.Lootbox.LootboxRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.Profile.UserService;
import com.casino.drawn.Services.JWT.JwtUtil;
import com.casino.drawn.Services.Lootbox.LootboxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class LootboxController {

    @Autowired
    private LootboxService lootboxService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LootboxRepository lootboxRepository;


    @GetMapping("/lootbox/{lootboxId}/items")
    public List<Item> getLootboxItems(@PathVariable int lootboxId) {

        return lootboxService.getLootboxItems(lootboxId);
    }

    @GetMapping("/lootbox")
    public List<Lootbox> getLootbox() {
        return lootboxService.getLootboxes();
    }

    @PostMapping("/lootbox/open")
    public ResponseEntity<?> openLootbox(
                                @RequestHeader("Authorization") String token,
                                @RequestBody LootboxOpenRequest request
    ) {
        // Validate JWT token
        if (jwtUtil.validateToken(token) == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(
                            false,
                            "Authentication failed",
                            new ErrorDetails("INVALID_TOKEN", "Invalid or expired authentication token")
                    ));
        }


        return ResponseEntity.ok()
                .body(new ApiResponse(
                        true,
                        "Lootbox opened successfully",
                        lootboxService.openLootbox(token, request)
                ));


    }
}
