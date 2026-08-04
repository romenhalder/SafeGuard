package com.safeguard.analytics.controller;

import com.safeguard.analytics.dto.AnalyticsReport;
import com.safeguard.analytics.service.AnalyticsService;
import com.safeguard.common.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<AnalyticsReport>> generateReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.generateReport(start, end)));
    }

    @GetMapping("/reports/response-time")
    public ResponseEntity<ApiResponse<Double>> getAverageResponseTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.generateReport(start, end).getAverageResponseTimeSeconds()));
    }

    @GetMapping("/reports/zone-activity")
    public ResponseEntity<ApiResponse<AnalyticsReport>> getZoneActivity(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.generateReport(start, end)));
    }
}
