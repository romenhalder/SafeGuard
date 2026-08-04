package com.safeguard.alert.repository;

import com.safeguard.alert.entity.SosIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SosIncidentRepository extends JpaRepository<SosIncident, UUID> {
    List<SosIncident> findByCitizenId(UUID citizenId);
    List<SosIncident> findByStatus(String status);
    List<SosIncident> findByAssignedOfficerId(UUID officerId);
    List<SosIncident> findByStatusIn(List<String> statuses);

    @Query(value = "SELECT * FROM sos_incidents WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius) AND status = 'PENDING' ORDER BY created_at DESC", nativeQuery = true)
    List<SosIncident> findNearbyPending(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radiusMeters);

    long countByStatus(String status);
}
