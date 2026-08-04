package com.safeguard.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsReport {
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Double averageResponseTimeSeconds;
    private Double averageCitizenRating;
    private Long totalIncidents;
    private Map<String, Long> incidentsByType;
    private Map<String, Long> incidentsByStatus;
    private List<Object[]> incidentsByHour;
    private List<Object[]> officerPerformance;
}
