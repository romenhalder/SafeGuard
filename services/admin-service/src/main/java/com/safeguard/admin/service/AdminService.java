package com.safeguard.admin.service;

import com.safeguard.admin.dto.DashboardOverview;
import com.safeguard.admin.entity.Officer;
import com.safeguard.admin.entity.PatrolZone;
import com.safeguard.admin.entity.SosIncident;
import com.safeguard.admin.repository.OfficerRepository;
import com.safeguard.admin.repository.PatrolZoneRepository;
import com.safeguard.admin.repository.SosIncidentRepository;
import com.safeguard.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final OfficerRepository officerRepository;
    private final PatrolZoneRepository patrolZoneRepository;
    private final SosIncidentRepository sosIncidentRepository;

    public DashboardOverview getDashboardOverview() {
        long totalOfficers = officerRepository.count();
        long onDutyOfficers = officerRepository.countByDutyStatus("ON_DUTY");
        long offDutyOfficers = totalOfficers - onDutyOfficers;
        long activeIncidents = sosIncidentRepository.countByStatus("IN_PROGRESS") + sosIncidentRepository.countByStatus("PENDING");
        long resolvedIncidents = sosIncidentRepository.countByStatus("RESOLVED");
        long totalZones = patrolZoneRepository.count();
        long incidentsToday = sosIncidentRepository.countByCreatedAtAfter(LocalDate.now().atStartOfDay());
        Double avgResponse = sosIncidentRepository.getAverageResponseTime(
                LocalDateTime.now().minusDays(30), LocalDateTime.now());

        return DashboardOverview.builder()
                .totalOfficers(totalOfficers)
                .onDutyOfficers(onDutyOfficers)
                .offDutyOfficers(offDutyOfficers)
                .activeIncidents(activeIncidents)
                .resolvedIncidents(resolvedIncidents)
                .totalZones(totalZones)
                .incidentsToday(incidentsToday)
                .averageResponseTimeSeconds(avgResponse)
                .build();
    }

    public List<Officer> getAllOfficers() {
        return officerRepository.findAll();
    }

    public List<Officer> getOnDutyOfficers() {
        return officerRepository.findByDutyStatus("ON_DUTY");
    }

    public Officer getOfficer(UUID id) {
        return officerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Officer", "id", id));
    }

    @Transactional
    public Officer createOfficer(Officer officer) {
        return officerRepository.save(officer);
    }

    @Transactional
    public Officer updateOfficer(UUID id, Officer updates) {
        Officer officer = getOfficer(id);
        if (updates.getName() != null) officer.setName(updates.getName());
        if (updates.getRank() != null) officer.setRank(updates.getRank());
        if (updates.getPhone() != null) officer.setPhone(updates.getPhone());
        if (updates.getDutyStatus() != null) officer.setDutyStatus(updates.getDutyStatus());
        return officerRepository.save(officer);
    }

    @Transactional
    public void deactivateOfficer(UUID id) {
        Officer officer = getOfficer(id);
        officer.setActive(false);
        officer.setDutyStatus("OFF_DUTY");
        officerRepository.save(officer);
        log.info("Officer deactivated: {}", id);
    }

    public List<PatrolZone> getAllZones() {
        return patrolZoneRepository.findAll();
    }

    @Transactional
    public PatrolZone createZone(PatrolZone zone) {
        return patrolZoneRepository.save(zone);
    }

    public List<SosIncident> getIncidents(String status, String incidentType) {
        if (StringUtils.hasText(status) && StringUtils.hasText(incidentType)) {
            return sosIncidentRepository.findByStatusAndIncidentType(status, incidentType);
        }
        if (StringUtils.hasText(status)) {
            return sosIncidentRepository.findByStatus(status);
        }
        return sosIncidentRepository.findAllByOrderByCreatedAtDesc();
    }

    public SosIncident getIncident(UUID id) {
        return sosIncidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", id));
    }
}
