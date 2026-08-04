package com.safeguard.common.dto.alert;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerLocationDto {
    private UUID officerId;
    private String officerName;
    private String rank;
    private Double latitude;
    private Double longitude;
    private Double distanceMeters;
    private String dutyStatus;
    private LocalDateTime lastUpdate;
}
