package com.safeguard.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverview {
    private long totalOfficers;
    private long onDutyOfficers;
    private long offDutyOfficers;
    private long activeIncidents;
    private long resolvedIncidents;
    private long totalZones;
    private long incidentsToday;
    private Double averageResponseTimeSeconds;
}
