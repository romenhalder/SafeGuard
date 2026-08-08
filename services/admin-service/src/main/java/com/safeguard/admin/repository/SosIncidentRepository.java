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
    List<SosIncident> findByStatusAndIncidentType(String status, String incidentType);
    List<SosIncident> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByCreatedAtAfter(LocalDateTime date);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (officer_accepted_at - alert_sent_at)))::float8 FROM sos_incidents WHERE officer_accepted_at IS NOT NULL AND alert_sent_at IS NOT NULL AND created_at BETWEEN :start AND :end", nativeQuery = true)
    Double getAverageResponseTime(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i.incidentType, COUNT(i) FROM SosIncident i WHERE i.createdAt BETWEEN :start AND :end GROUP BY i.incidentType ORDER BY COUNT(i) DESC")
    List<Object[]> getIncidentsByType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i.assignedOfficerId, COUNT(i) FROM SosIncident i WHERE i.createdAt BETWEEN :start AND :end AND i.assignedOfficerId IS NOT NULL GROUP BY i.assignedOfficerId ORDER BY COUNT(i) DESC")
    List<Object[]> getOfficerPerformance(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
