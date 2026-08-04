package com.safeguard.alert.controller;

import com.safeguard.alert.entity.SosIncident;
import com.safeguard.alert.service.AlertDispatchService;
import com.safeguard.common.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
public class OfficerAlertController {

    private final AlertDispatchService alertDispatchService;

    @PostMapping("/alert/{id}/accept")
    public ResponseEntity<ApiResponse<SosIncident>> acceptAlert(
            @PathVariable UUID id, @RequestHeader("X-User-Id") UUID officerId) {
        return ResponseEntity.ok(ApiResponse.success("Alert accepted", alertDispatchService.acceptAlert(id, officerId)));
    }

    @PostMapping("/alert/{id}/reject")
    public ResponseEntity<ApiResponse<SosIncident>> rejectAlert(
            @PathVariable UUID id, @RequestHeader("X-User-Id") UUID officerId) {
        return ResponseEntity.ok(ApiResponse.success("Alert rejected", alertDispatchService.rejectAlert(id, officerId)));
    }

    @PostMapping("/incident/{id}/arrived")
    public ResponseEntity<ApiResponse<SosIncident>> officerArrived(
            @PathVariable UUID id, @RequestHeader("X-User-Id") UUID officerId) {
        return ResponseEntity.ok(ApiResponse.success("Arrival recorded", alertDispatchService.officerArrived(id, officerId)));
    }

    @PostMapping("/incident/{id}/resolve")
    public ResponseEntity<ApiResponse<SosIncident>> resolveIncident(
            @PathVariable UUID id, @RequestHeader("X-User-Id") UUID officerId) {
        return ResponseEntity.ok(ApiResponse.success("Incident resolved", alertDispatchService.resolveIncident(id, officerId)));
    }
}
