package com.safeguard.alert.service;

import com.safeguard.alert.config.RedisStreamConfig;
import com.safeguard.alert.entity.SosIncident;
import com.safeguard.alert.repository.SosIncidentRepository;
import com.safeguard.common.exception.BadRequestException;
import com.safeguard.common.exception.ResourceNotFoundException;
import com.safeguard.common.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertDispatchService {

    private final SosIncidentRepository sosIncidentRepository;
    private final RedisStreamConfig redisStreamConfig;

    private static final double DEFAULT_RADIUS_METERS = 5000;
    private static final int DEFAULT_OFFICER_LIMIT = 5;

    @Transactional
    public SosIncident triggerSos(UUID citizenId, String incidentType, String description,
                                  double lat, double lng, String addressText, String priority) {

        String effectivePriority = priority != null ? priority.toUpperCase() : "NORMAL";

        SosIncident incident = SosIncident.builder()
                .citizenId(citizenId)
                .incidentType(incidentType)
                .description(description)
                .location(String.format("SRID=4326;POINT(%f %f)", lng, lat))
                .addressText(addressText)
                .status("PENDING")
                .priority(effectivePriority)
                .alertSentAt(LocalDateTime.now())
                .build();

        incident = sosIncidentRepository.save(incident);

        redisStreamConfig.publishSosAlert(
                citizenId.toString(), incident.getId().toString(),
                lat, lng, incidentType, effectivePriority);

        log.info("SOS triggered: citizen={}, incident={}, type={}, priority={}",
                citizenId, incident.getId(), incidentType, effectivePriority);

        return incident;
    }

    @Transactional
    public SosIncident acceptAlert(UUID incidentId, UUID officerId) {
        SosIncident incident = getIncident(incidentId);

        if (!"PENDING".equals(incident.getStatus()) && !"ASSIGNED".equals(incident.getStatus())) {
            throw new BadRequestException("Incident is not in an assignable state");
        }

        incident.setAssignedOfficerId(officerId);
        incident.setStatus("IN_PROGRESS");
        incident.setOfficerAcceptedAt(LocalDateTime.now());

        SosIncident saved = sosIncidentRepository.save(incident);

        redisStreamConfig.publishNotification(officerId, "SOS Accepted",
                "You have accepted SOS incident " + incidentId);

        log.info("Officer {} accepted incident {}", officerId, incidentId);
        return saved;
    }

    @Transactional
    public SosIncident rejectAlert(UUID incidentId, UUID officerId) {
        SosIncident incident = getIncident(incidentId);
        // Mark as rejected; system will reassign to next officer
        log.info("Officer {} rejected incident {}", officerId, incidentId);
        return incident;
    }

    @Transactional
    public SosIncident officerArrived(UUID incidentId, UUID officerId) {
        SosIncident incident = getIncident(incidentId);
        incident.setStatus("IN_PROGRESS");
        incident.setOfficerArrivedAt(LocalDateTime.now());
        log.info("Officer {} arrived at incident {}", officerId, incidentId);
        return sosIncidentRepository.save(incident);
    }

    @Transactional
    public SosIncident resolveIncident(UUID incidentId, UUID officerId) {
        SosIncident incident = getIncident(incidentId);
        incident.setStatus("RESOLVED");
        incident.setResolvedAt(LocalDateTime.now());

        SosIncident saved = sosIncidentRepository.save(incident);

        redisStreamConfig.publishNotification(officerId, "Incident Resolved",
                "Incident " + incidentId + " has been marked as resolved");

        log.info("Incident {} resolved by officer {}", incidentId, officerId);
        return saved;
    }

    @Transactional
    public void cancelSos(UUID incidentId, UUID citizenId) {
        SosIncident incident = getIncident(incidentId);
        if (!incident.getCitizenId().equals(citizenId)) {
            throw new BadRequestException("Not authorized to cancel this incident");
        }
        incident.setStatus("CANCELLED");
        sosIncidentRepository.save(incident);
        log.info("Incident {} cancelled by citizen {}", incidentId, citizenId);
    }

    @Transactional
    public SosIncident rateIncident(UUID incidentId, Integer rating) {
        SosIncident incident = getIncident(incidentId);
        if (!"RESOLVED".equals(incident.getStatus())) {
            throw new BadRequestException("Can only rate resolved incidents");
        }
        incident.setCitizenRating(rating);
        return sosIncidentRepository.save(incident);
    }

    public SosIncident getIncident(UUID incidentId) {
        return sosIncidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("SosIncident", "id", incidentId));
    }

    public double calculateDistanceMeters(double lat1, double lng1, double lat2, double lng2) {
        return GeoUtils.haversine(lat1, lng1, lat2, lng2);
    }
}
