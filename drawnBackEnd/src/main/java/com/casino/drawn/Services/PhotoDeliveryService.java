package com.casino.drawn.Services;


import com.casino.drawn.DTO.API.ApiResponse;
import com.casino.drawn.DTO.API.ErrorDetails;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
public class PhotoDeliveryService {

    public ErrorDetails deliverPhoto(HttpServletResponse response, String photoName)  throws IOException {
        Resource resource = new ClassPathResource("photos/" + photoName);

        if (!resource.exists()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return new ErrorDetails("INVALID_REQUEST", "Failed to deliver photo!");}

        try (InputStream in = resource.getInputStream()) {
            response.setContentType(MediaType.IMAGE_JPEG_VALUE);
            IOUtils.copy(in, response.getOutputStream());
            return new ErrorDetails("SUCCESS", "Successfully delivered photo!");
        }

    }
}
