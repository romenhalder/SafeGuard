package com.safeguard.location.repository;

import com.safeguard.location.entity.OfficerLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OfficerLocationRepository extends JpaRepository<OfficerLocation, UUID> {
    @Query(value = "SELECT * FROM officer_locations ol WHERE ol.officer_id = :officerId ORDER BY ol.recorded_at DESC LIMIT 1", nativeQuery = true)
    OfficerLocation findLatestByOfficerId(@Param("officerId") UUID officerId);

    @Query(value = "SELECT DISTINCT ON (ol.officer_id) ol.* FROM officer_locations ol ORDER BY ol.officer_id, ol.recorded_at DESC", nativeQuery = true)
    List<OfficerLocation> findLatestForAllOfficers();
}
