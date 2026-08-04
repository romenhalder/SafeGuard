package com.safeguard.incident.service;

import com.safeguard.incident.model.IncidentLog;
import com.safeguard.incident.repository.IncidentLogRepository;
import com.safeguard.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentLogService {

    private final IncidentLogRepository incidentLogRepository;

    public IncidentLog createIncidentLog(String incidentId) {
        IncidentLog log = IncidentLog.builder()
                .incidentId(incidentId)
                .createdAt(LocalDateTime.now())
                .build();
        log.getEvents().add(IncidentLog.IncidentEvent.builder()
                .event("INCIDENT_CREATED")
                .timestamp(LocalDateTime.now())
                .build());
        return incidentLogRepository.save(log);
    }

    public IncidentLog appendEvent(String incidentId, String event, Object data) {
        IncidentLog log = incidentLogRepository.findByIncidentId(incidentId)
                .orElseGet(() -> createIncidentLog(incidentId));

        log.getEvents().add(IncidentLog.IncidentEvent.builder()
                .event(event)
                .timestamp(LocalDateTime.now())
                .data(data)
                .build());

        return incidentLogRepository.save(log);
    }

    public IncidentLog getIncidentLog(String incidentId) {
        return incidentLogRepository.findByIncidentId(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("IncidentLog", "incidentId", incidentId));
    }

    public List<IncidentLog> getIncidentLogsBetween(LocalDateTime start, LocalDateTime end) {
        return incidentLogRepository.findByCreatedAtBetween(start, end);
    }
}
