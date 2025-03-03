package com.casino.drawn.controller;


import com.casino.drawn.dto.api.ApiResponse;
import com.casino.drawn.dto.api.ErrorDetails;
import com.casino.drawn.services.PhotoDeliveryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Objects;

@RestController
@RequestMapping("/api")

public class PhotoController {

    private final PhotoDeliveryService photoDeliveryService;

    public PhotoController(PhotoDeliveryService photoDeliveryService) {
        this.photoDeliveryService = photoDeliveryService;
    }

    @GetMapping("/item/{photoName}")
    public ResponseEntity<?> getPhoto(HttpServletResponse servletResponse, @PathVariable String photoName) throws IOException {
        ErrorDetails response = photoDeliveryService.deliverPhoto(servletResponse, photoName);

        if (Objects.equals(response.getCode(), "INVALID_REQUEST")){
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(
                            false,
                            "Photo requested doesn't exist.",
                            new ErrorDetails("INVALID_REQUEST", "Failed to deliver photo.")
                    ));
        }
        return null;

    }
}
