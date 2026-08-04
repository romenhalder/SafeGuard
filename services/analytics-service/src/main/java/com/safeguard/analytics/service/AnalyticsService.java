package com.safeguard.analytics.service;

import com.safeguard.analytics.dto.AnalyticsReport;
import com.safeguard.analytics.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsReport generateReport(LocalDateTime start, LocalDateTime end) {
        Double avgResponse = analyticsRepository.getAverageResponseTime(start, end);
        Double avgRating = analyticsRepository.getAverageRating(start, end);
        Long totalIncidents = analyticsRepository.countByCreatedAtBetween(start, end);

        Map<String, Long> byType = new HashMap<>();
        for (Object[] row : analyticsRepository.getIncidentsByType(start, end)) {
            byType.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : analyticsRepository.getIncidentsByStatus(start, end)) {
            byStatus.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }

        List<Object[]> byHour = analyticsRepository.getIncidentsByHour(start, end);
        List<Object[]> officerPerf = analyticsRepository.getOfficerPerformance(start, end);

        return AnalyticsReport.builder()
                .periodStart(start)
                .periodEnd(end)
                .averageResponseTimeSeconds(avgResponse)
                .averageCitizenRating(avgRating)
                .totalIncidents(totalIncidents)
                .incidentsByType(byType)
                .incidentsByStatus(byStatus)
                .incidentsByHour(byHour)
                .officerPerformance(officerPerf)
                .build();
    }
}
