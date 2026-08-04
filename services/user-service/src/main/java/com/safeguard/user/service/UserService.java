package com.safeguard.user.service;

import com.safeguard.common.exception.ResourceNotFoundException;
import com.safeguard.user.entity.Citizen;
import com.safeguard.user.entity.Officer;
import com.safeguard.user.entity.PatrolZone;
import com.safeguard.user.repository.CitizenRepository;
import com.safeguard.user.repository.OfficerRepository;
import com.safeguard.user.repository.PatrolZoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final CitizenRepository citizenRepository;
    private final OfficerRepository officerRepository;
    private final PatrolZoneRepository patrolZoneRepository;

    public Citizen getCitizen(UUID id) {
        return citizenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen", "id", id));
    }

    @Transactional
    public Citizen updateCitizen(UUID id, Citizen updates) {
        Citizen citizen = getCitizen(id);
        if (updates.getName() != null) citizen.setName(updates.getName());
        if (updates.getEmail() != null) citizen.setEmail(updates.getEmail());
        if (updates.getAddress() != null) citizen.setAddress(updates.getAddress());
        return citizenRepository.save(citizen);
    }

    public Page<Officer> getAllOfficers(Pageable pageable) {
        return officerRepository.findAll(pageable);
    }

    public Officer getOfficer(UUID id) {
        return officerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Officer", "id", id));
    }

    public List<Officer> getNearbyOfficers(double lat, double lng, double radiusMeters) {
        return officerRepository.findNearbyOfficers(lat, lng, radiusMeters);
    }

    public List<Officer> getOfficersByZone(UUID zoneId) {
        return officerRepository.findByAssignedZoneId(zoneId);
    }

    public List<Officer> getOnDutyOfficers() {
        return officerRepository.findByDutyStatus("ON_DUTY");
    }

    @Transactional
    public Officer updateDutyStatus(UUID officerId, String status) {
        Officer officer = getOfficer(officerId);
        officer.setDutyStatus(status);
        return officerRepository.save(officer);
    }

    public Page<PatrolZone> getAllZones(Pageable pageable) {
        return patrolZoneRepository.findAll(pageable);
    }

    public PatrolZone getZone(UUID id) {
        return patrolZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PatrolZone", "id", id));
    }

    @Transactional
    public PatrolZone createZone(PatrolZone zone) {
        return patrolZoneRepository.save(zone);
    }

    @Transactional
    public PatrolZone updateZone(UUID id, PatrolZone updates) {
        PatrolZone zone = getZone(id);
        if (updates.getZoneName() != null) zone.setZoneName(updates.getZoneName());
        if (updates.getAreaName() != null) zone.setAreaName(updates.getAreaName());
        if (updates.getThanaName() != null) zone.setThanaName(updates.getThanaName());
        if (updates.getDistrict() != null) zone.setDistrict(updates.getDistrict());
        return patrolZoneRepository.save(zone);
    }
}
