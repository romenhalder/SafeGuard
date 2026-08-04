package com.safeguard.notification.controller;

import com.safeguard.common.util.ApiResponse;
import com.safeguard.notification.dto.NotificationRequest;
import com.safeguard.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/push")
    public ResponseEntity<ApiResponse<Void>> sendPush(@Valid @RequestBody NotificationRequest request) {
        notificationService.sendPushNotification(request);
        return ResponseEntity.ok(ApiResponse.success("Push notification sent"));
    }

    @PostMapping("/ws/{userId}")
    public ResponseEntity<ApiResponse<Void>> sendWebSocket(
            @PathVariable String userId, @Valid @RequestBody NotificationRequest request) {
        notificationService.sendWebSocketNotification(userId, request);
        return ResponseEntity.ok(ApiResponse.success("WebSocket notification sent"));
    }

    @PostMapping("/topic/{topic}")
    public ResponseEntity<ApiResponse<Void>> sendToTopic(
            @PathVariable String topic, @Valid @RequestBody NotificationRequest request) {
        notificationService.sendToTopic(topic, request);
        return ResponseEntity.ok(ApiResponse.success("Topic notification sent"));
    }

    @PostMapping("/sms")
    public ResponseEntity<ApiResponse<Void>> sendSms(
            @RequestParam String phone, @RequestParam String message) {
        notificationService.sendSms(phone, message);
        return ResponseEntity.ok(ApiResponse.success("SMS sent"));
    }
}
