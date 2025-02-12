package com.casino.drawn.Controller;


import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import com.casino.drawn.Services.PhotoDeliveryService;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://drawngg.com")
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
