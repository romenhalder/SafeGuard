package com.safeguard.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safeguard.notification.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String NOTIFICATION_STREAM = "safeguard:notifications";

    public void sendPushNotification(NotificationRequest request) {
        log.info("Sending push notification: title={}, recipient={}", request.getTitle(), request.getRecipientId());
        // FCM integration would go here using firebase-admin
    }

    public void sendWebSocketNotification(String userId, NotificationRequest request) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", request);
        log.info("Sent WebSocket notification to user: {}", userId);
    }

    public void sendToTopic(String topic, NotificationRequest request) {
        messagingTemplate.convertAndSend("/topic/" + topic, request);
        log.info("Sent notification to topic: {}", topic);
    }

    public void sendSms(String phoneNumber, String message) {
        log.info("Sending SMS to {}: {}", phoneNumber, message);
        // Twilio/MSG91 integration would go here
    }

    public void processRedisStream() {
        try {
            var entries = redisTemplate.opsForStream()
                    .read(org.springframework.data.redis.connection.stream.StreamOffset.fromStart(NOTIFICATION_STREAM));
            if (entries != null) {
                for (var entry : entries) {
                    Map<Object, Object> entryData = entry.getValue();
                    Map<String, String> data = new java.util.HashMap<>();
                    entryData.forEach((k, v) -> data.put(String.valueOf(k), String.valueOf(v)));
                    log.info("Processing notification from stream: {}", data);
                    String userId = data.get("officerId");
                    NotificationRequest request = NotificationRequest.builder()
                            .recipientId(userId)
                            .title(data.get("title"))
                            .message(data.get("message"))
                            .type("SOS_ALERT")
                            .build();
                    sendWebSocketNotification(userId, request);
                    sendPushNotification(request);
                }
            }
        } catch (Exception e) {
            log.warn("Could not process notification stream: {}", e.getMessage());
        }
    }
}
