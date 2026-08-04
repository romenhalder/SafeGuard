package com.safeguard.location.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safeguard.common.exception.ResourceNotFoundException;
import com.safeguard.location.entity.OfficerLocation;
import com.safeguard.location.repository.OfficerLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final OfficerLocationRepository officerLocationRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String OFFICER_LOCATION_KEY = "officer:%s:location";
    private static final Duration LOCATION_TTL = Duration.ofSeconds(30);

    @Transactional
    public void updateOfficerLocation(UUID officerId, double lat, double lng) {
        OfficerLocation location = OfficerLocation.builder()
                .officerId(officerId)
                .location(String.format("SRID=4326;POINT(%f %f)", lng, lat))
                .recordedAt(LocalDateTime.now())
                .build();

        officerLocationRepository.save(location);

        Map<String, Object> locationData = new HashMap<>();
        locationData.put("lat", lat);
        locationData.put("lng", lng);
        locationData.put("timestamp", LocalDateTime.now().toString());
        locationData.put("officerId", officerId.toString());

        String key = String.format(OFFICER_LOCATION_KEY, officerId);
        redisTemplate.opsForValue().set(key, locationData, LOCATION_TTL);

        log.debug("Updated location for officer {}: ({}, {})", officerId, lat, lng);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getOfficerCurrentLocation(UUID officerId) {
        String key = String.format(OFFICER_LOCATION_KEY, officerId);
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached instanceof Map) {
            return (Map<String, Object>) cached;
        }

        OfficerLocation latest = officerLocationRepository.findLatestByOfficerId(officerId);
        if (latest == null) {
            throw new ResourceNotFoundException("Location", "officerId", officerId);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("officerId", latest.getOfficerId().toString());
        result.put("recordedAt", latest.getRecordedAt().toString());
        return result;
    }

    public List<OfficerLocation> getAllLatestLocations() {
        return officerLocationRepository.findLatestForAllOfficers();
    }
}
