package com.casino.drawn.Controller;


import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PhotoController {

    @GetMapping("/item/{photoName}")
    public void getPhoto(HttpServletResponse response, @PathVariable String photoName) throws IOException {
        Resource resource = new ClassPathResource("photos/" + photoName);

        if (!resource.exists()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        try (InputStream in = resource.getInputStream()) {
            response.setContentType(MediaType.IMAGE_PNG_VALUE);
            IOUtils.copy(in, response.getOutputStream());
        }
    } // TURN THIS INTO SERVICE AND FIX HTTP RESPONSES
}
