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

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (officer_accepted_at - alert_sent_at)))::float8 FROM sos_incidents WHERE officer_accepted_at IS NOT NULL AND alert_sent_at IS NOT NULL AND created_at BETWEEN :start AND :end", nativeQuery = true)
    Double getAverageResponseTime(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i.incidentType, COUNT(i) FROM SosIncident i WHERE i.createdAt BETWEEN :start AND :end GROUP BY i.incidentType ORDER BY COUNT(i) DESC")
    List<Object[]> getIncidentsByType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.status, COUNT(s) FROM SosIncident s WHERE s.createdAt BETWEEN :start AND :end GROUP BY s.status")
    List<Object[]> getIncidentsByStatus(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT date_trunc('hour', created_at), COUNT(*) FROM sos_incidents WHERE created_at BETWEEN :start AND :end GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<Object[]> getIncidentsByHour(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT AVG(s.citizenRating) FROM SosIncident s WHERE s.citizenRating IS NOT NULL AND s.createdAt BETWEEN :start AND :end")
    Double getAverageRating(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT assigned_officer_id, COUNT(*), AVG(EXTRACT(EPOCH FROM (officer_arrived_at - alert_sent_at)))::float8 FROM sos_incidents WHERE assigned_officer_id IS NOT NULL AND created_at BETWEEN :start AND :end GROUP BY assigned_officer_id", nativeQuery = true)
    List<Object[]> getOfficerPerformance(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
