package com.safeguard.common.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneDto {
    private UUID id;
    @NotBlank(message = "Zone name is required")
    private String zoneName;
    private String areaName;
    private String thanaName;
    private String district;
    private String state;
    private UUID ocOfficerId;
    private String zoneBoundaryGeoJson;
}
