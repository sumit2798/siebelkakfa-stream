package com.example.clickbait.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventConsumer {

    private static final Logger log = LoggerFactory.getLogger(EventConsumer.class);
    private final SimpMessagingTemplate messagingTemplate;

    public EventConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "clickbait-events", groupId = "clickbait-dashboard-group")
    public void listen(String message) {
        log.info("Received message from Kafka: {}", message);
        // Forward message to WebSocket topic
        messagingTemplate.convertAndSend("/topic/clicks", message);
    }
}
