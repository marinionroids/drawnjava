package com.casino.drawn.Controller.Lootbox;

import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import com.casino.drawn.DTO.Lootbox.LootboxItemResponse;
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
@CrossOrigin(origins = "https://drawngg.com")
public class LootboxController {

    private final LootboxService lootboxService;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserRepository userRepository;
    private final LootboxRepository lootboxRepository;

    public LootboxController(LootboxService lootboxService, JwtUtil jwtUtil, UserService userService, UserRepository userRepository, LootboxRepository lootboxRepository) {
        this.lootboxService = lootboxService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.userRepository = userRepository;
        this.lootboxRepository = lootboxRepository;
    }


    @GetMapping("/lootbox/{lootboxName}/items")
    public List<LootboxItemResponse> getLootboxItems(@PathVariable String lootboxName) {

        return lootboxService.getLootboxItems(lootboxName);
    }

    @GetMapping("/lootbox/{lootboxName}")
    public Lootbox getLootbox(@PathVariable String lootboxName) {
        return lootboxRepository.getLootboxByLootboxName(lootboxName);
    }
    @GetMapping("/lootbox")
    public ResponseEntity<?> getLootbox() {
        return ResponseEntity
                .ok()
                .body(lootboxService.getLootboxes()
                );
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
