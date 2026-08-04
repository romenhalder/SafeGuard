package com.safeguard.common.dto.user;

import jakarta.validation.constraints.NotBlank;
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
public class OfficerDto {
    private UUID id;
    @NotBlank(message = "Department ID is required")
    private String departmentId;
    @NotBlank(message = "Name is required")
    private String name;
    private String rank;
    @NotBlank(message = "Phone is required")
    private String phone;
    private String badgeNumber;
    private UUID assignedZoneId;
    private String zoneName;
    private String dutyStatus;
    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime lastLocationUpdate;
    private LocalDateTime createdAt;
}
