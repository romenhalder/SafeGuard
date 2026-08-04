package com.safeguard.analytics.repository;

import com.safeguard.analytics.entity.SosIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<SosIncident, UUID> {

    @Query("SELECT AVG(FUNCTION('EXTRACT', 'EPOCH', s.officerAcceptedAt - s.alertSentAt)) FROM SosIncident s WHERE s.officerAcceptedAt IS NOT NULL AND s.alertSentAt IS NOT NULL AND s.createdAt BETWEEN :start AND :end")
    Double getAverageResponseTime(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i.incidentType, COUNT(i) FROM SosIncident i WHERE i.createdAt BETWEEN :start AND :end GROUP BY i.incidentType ORDER BY COUNT(i) DESC")
    List<Object[]> getIncidentsByType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.status, COUNT(s) FROM SosIncident s WHERE s.createdAt BETWEEN :start AND :end GROUP BY s.status")
    List<Object[]> getIncidentsByStatus(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT FUNCTION('date_trunc', 'hour', s.createdAt), COUNT(s) FROM SosIncident s WHERE s.createdAt BETWEEN :start AND :end GROUP BY 1 ORDER BY 1")
    List<Object[]> getIncidentsByHour(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT AVG(s.citizenRating) FROM SosIncident s WHERE s.citizenRating IS NOT NULL AND s.createdAt BETWEEN :start AND :end")
    Double getAverageRating(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.assignedOfficerId, COUNT(s), AVG(FUNCTION('EXTRACT', 'EPOCH', s.officerArrivedAt - s.alertSentAt)) FROM SosIncident s WHERE s.assignedOfficerId IS NOT NULL AND s.createdAt BETWEEN :start AND :end GROUP BY s.assignedOfficerId")
    List<Object[]> getOfficerPerformance(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
