package com.safeguard.alert.controller;

import com.safeguard.alert.entity.SosIncident;
import com.safeguard.alert.service.AlertDispatchService;
import com.safeguard.common.dto.alert.SosTriggerRequest;
import com.safeguard.common.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
public class SosController {

    private final AlertDispatchService alertDispatchService;

    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<SosIncident>> triggerSos(
            @RequestHeader("X-User-Id") UUID citizenId,
            @Valid @RequestBody SosTriggerRequest request) {
        SosIncident incident = alertDispatchService.triggerSos(
                citizenId, request.getIncidentType(), request.getDescription(),
                request.getLatitude(), request.getLongitude(),
                request.getAddressText(), request.getPriority());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("SOS alert triggered", incident));
    }

    @GetMapping("/incident/{id}/status")
    public ResponseEntity<ApiResponse<SosIncident>> getIncidentStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(alertDispatchService.getIncident(id)));
    }

    @PostMapping("/incident/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelSos(
            @PathVariable UUID id, @RequestHeader("X-User-Id") UUID citizenId) {
        alertDispatchService.cancelSos(id, citizenId);
        return ResponseEntity.ok(ApiResponse.success("SOS cancelled"));
    }

    @PostMapping("/incident/{id}/rate")
    public ResponseEntity<ApiResponse<SosIncident>> rateIncident(
            @PathVariable UUID id, @RequestParam int rating) {
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Rating must be between 1 and 5"));
        }
        return ResponseEntity.ok(ApiResponse.success("Rated", alertDispatchService.rateIncident(id, rating)));
    }
}
