package com.safeguard.incident.controller;

import com.safeguard.common.util.ApiResponse;
import com.safeguard.incident.model.IncidentLog;
import com.safeguard.incident.service.IncidentLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentLogService incidentLogService;

    @PostMapping
    public ResponseEntity<ApiResponse<IncidentLog>> createIncidentLog(@RequestParam String incidentId) {
        return ResponseEntity.ok(ApiResponse.success("Log created", incidentLogService.createIncidentLog(incidentId)));
    }

    @PostMapping("/{incidentId}/events")
    public ResponseEntity<ApiResponse<IncidentLog>> appendEvent(
            @PathVariable String incidentId,
            @RequestParam String event,
            @RequestBody(required = false) Object data) {
        return ResponseEntity.ok(ApiResponse.success("Event appended", incidentLogService.appendEvent(incidentId, event, data)));
    }

    @GetMapping("/{incidentId}")
    public ResponseEntity<ApiResponse<IncidentLog>> getIncidentLog(@PathVariable String incidentId) {
        return ResponseEntity.ok(ApiResponse.success(incidentLogService.getIncidentLog(incidentId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IncidentLog>>> getLogsBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(incidentLogService.getIncidentLogsBetween(start, end)));
    }
}
