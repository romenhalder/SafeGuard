package com.safeguard.admin.repository;

import com.safeguard.admin.entity.SosIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SosIncidentRepository extends JpaRepository<SosIncident, UUID> {
    List<SosIncident> findByStatus(String status);
    long countByStatus(String status);
    long countByCreatedAtAfter(LocalDateTime date);

    @Query("SELECT AVG(FUNCTION('EXTRACT', 'EPOCH', s.officerAcceptedAt - s.alertSentAt)) FROM SosIncident s WHERE s.officerAcceptedAt IS NOT NULL AND s.alertSentAt IS NOT NULL AND s.createdAt BETWEEN :start AND :end")
    Double getAverageResponseTime(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i.incidentType, COUNT(i) FROM SosIncident i WHERE i.createdAt BETWEEN :start AND :end GROUP BY i.incidentType ORDER BY COUNT(i) DESC")
    List<Object[]> getIncidentsByType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i.assignedOfficerId, COUNT(i) FROM SosIncident i WHERE i.createdAt BETWEEN :start AND :end AND i.assignedOfficerId IS NOT NULL GROUP BY i.assignedOfficerId ORDER BY COUNT(i) DESC")
    List<Object[]> getOfficerPerformance(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
