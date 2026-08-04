package com.safeguard.common.dto.location;

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
public class OfficerLocationResponse {
    private UUID officerId;
    private String officerName;
    private String rank;
    private Double latitude;
    private Double longitude;
    private String dutyStatus;
    private LocalDateTime lastLocationUpdate;
}
