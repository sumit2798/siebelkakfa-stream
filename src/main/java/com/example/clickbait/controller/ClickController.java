package com.example.clickbait.controller;

import com.example.clickbait.service.EventProducer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/click")
public class ClickController {

    private final EventProducer eventProducer;
    private final ObjectMapper objectMapper;

    public ClickController(EventProducer eventProducer, ObjectMapper objectMapper) {
        this.eventProducer = eventProducer;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public void trackClick(@RequestBody Map<String, Object> payload) throws JsonProcessingException {
        String message = objectMapper.writeValueAsString(payload);
        eventProducer.sendClickEvent(message);
    }
}
