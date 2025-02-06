package com.casino.drawn.Controller.Lootbox;

import com.casino.drawn.DTO.Lootbox.LootboxOpenRequest;
import com.casino.drawn.Model.Lootbox.Item;
import com.casino.drawn.Model.Lootbox.Lootbox;
import com.casino.drawn.Model.User;
import com.casino.drawn.Repository.Lootbox.LootboxRepository;
import com.casino.drawn.Repository.UserRepository;
import com.casino.drawn.Services.Profile.UserService;
import com.casino.drawn.Services.JWT.JwtUtil;
import com.casino.drawn.Services.Solana.LootboxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<Map<String, Object>> openLootbox(
                                @RequestHeader("Authorization") String token,
                                @RequestBody LootboxOpenRequest request
    ) {
        String walletAddress = jwtUtil.validateToken(token);
        User user = userRepository.findByPrimaryWalletAddress(walletAddress);
        Lootbox lootbox = lootboxRepository.getLootboxById(request.getLootboxId());

        // Checks whether the JWT was valid and also checks that the user has sufficent balance.
        if (walletAddress != null){

            ResponseEntity<?> balanceCheck = userService.checkForSufficientBalance(user.getUserId(), lootbox.getPrice());
            if (balanceCheck.getStatusCode() == HttpStatus.BAD_REQUEST) {
                // Return the same balance error response but as a Map
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Not enough balance");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            request.setUserId(user.getUserId());
            Map<String, Object> response = lootboxService.purchaseAndOpenLootbox(request.getLootboxId(), user.getUserId(), request);
            return ResponseEntity.ok(response);
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("message", "Bad Authentication");
        return ResponseEntity.badRequest().body(errorResponse);
    }
}
