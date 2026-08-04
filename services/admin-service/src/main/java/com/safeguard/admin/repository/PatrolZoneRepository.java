package com.safeguard.admin.repository;

import com.safeguard.admin.entity.PatrolZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PatrolZoneRepository extends JpaRepository<PatrolZone, UUID> {}
