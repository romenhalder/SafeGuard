package com.safeguard.common.dto.incident;

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
public class IncidentDto {
    private UUID id;
    private UUID citizenId;
    private String citizenName;
    private String incidentType;
    private String description;
    private Double latitude;
    private Double longitude;
    private String addressText;
    private String status;
    private String priority;
    private UUID assignedOfficerId;
    private String assignedOfficerName;
    private LocalDateTime alertSentAt;
    private LocalDateTime officerAcceptedAt;
    private LocalDateTime officerArrivedAt;
    private LocalDateTime resolvedAt;
    private Integer citizenRating;
    private LocalDateTime createdAt;
}
