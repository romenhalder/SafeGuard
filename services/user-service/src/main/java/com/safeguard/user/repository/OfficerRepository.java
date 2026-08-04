package com.safeguard.user.repository;

import com.safeguard.user.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, UUID> {
    List<Officer> findByDutyStatus(String dutyStatus);
    List<Officer> findByActiveTrue();
    List<Officer> findByAssignedZoneId(UUID zoneId);

    @Query(value = "SELECT * FROM officers o WHERE o.duty_status = 'ON_DUTY' AND ST_DWithin(o.current_location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)", nativeQuery = true)
    List<Officer> findNearbyOfficers(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radiusMeters);
}
