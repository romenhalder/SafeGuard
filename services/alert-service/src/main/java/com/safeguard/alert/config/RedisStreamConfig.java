package com.safeguard.alert.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Configuration
public class RedisStreamConfig {

    @Value("${safeguard.stream.sos-alerts:safeguard:sos:alerts}")
    private String sosStream;

    @Value("${safeguard.stream.gps-updates:safeguard:gps:updates}")
    private String gpsStream;

    @Value("${safeguard.stream.notifications:safeguard:notifications}")
    private String notificationStream;

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisStreamConfig(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String publishSosAlert(String citizenId, String incidentId, double lat, double lng, String type, String priority) {
        Map<String, String> data = Map.of(
                "incidentId", incidentId,
                "citizenId", citizenId,
                "lat", String.valueOf(lat),
                "lng", String.valueOf(lng),
                "type", type,
                "priority", priority,
                "timestamp", String.valueOf(System.currentTimeMillis())
        );
        redisTemplate.opsForStream().add(sosStream, data);
        log.info("Published SOS alert to stream: incident={}", incidentId);
        return incidentId;
    }

    public void publishNotification(UUID officerId, String title, String message) {
        Map<String, String> data = Map.of(
                "officerId", officerId.toString(),
                "title", title,
                "message", message,
                "timestamp", String.valueOf(System.currentTimeMillis())
        );
        redisTemplate.opsForStream().add(notificationStream, data);
        log.info("Published notification to stream for officer: {}", officerId);
    }

    @Scheduled(fixedDelay = 30000)
    public void ensureStreamsExist() {
        try {
            redisTemplate.opsForStream().createGroup(sosStream, "alert-dispatch-group");
        } catch (Exception e) {
            // Group already exists
        }
    }
}
