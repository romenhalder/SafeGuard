package com.safeguard.incident.repository;

import com.safeguard.incident.model.IncidentLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentLogRepository extends MongoRepository<IncidentLog, String> {
    Optional<IncidentLog> findByIncidentId(String incidentId);
    List<IncidentLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    void deleteByIncidentId(String incidentId);
}
