package com.safeguard.common.dto.alert;

import jakarta.validation.constraints.NotNull;
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
public class SosAlertDto {
    private UUID id;
    private UUID citizenId;
    private String citizenName;
    private String citizenPhone;
    @NotNull(message = "Incident type is required")
    private String incidentType;
    private String description;
    @NotNull(message = "Latitude is required")
    private Double latitude;
    @NotNull(message = "Longitude is required")
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
}
