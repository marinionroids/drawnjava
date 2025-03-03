package com.casino.drawn.controller.lootbox;

import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.api.ErrorDetails;
import com.casino.drawn.dto.lootbox.LootboxItemResponse;
import com.casino.drawn.dto.lootbox.LootboxOpenRequest;
import com.casino.drawn.model.lootbox.Lootbox;
import com.casino.drawn.repository.lootbox.LootboxRepository;
import com.casino.drawn.repository.UserRepository;
import com.casino.drawn.services.profile.UserService;
import com.casino.drawn.services.jwt.JwtUtil;
import com.casino.drawn.services.lootbox.LootboxService;
import com.google.protobuf.Api;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")

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


    @GetMapping("/latestdrops")
    public ResponseEntity<?> latestDrops() {
        ApiResponse response = lootboxService.latestdrops();
        return new ResponseEntity<>(response, HttpStatus.OK);
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
