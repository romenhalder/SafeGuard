package com.safeguard.user.repository;

import com.safeguard.user.entity.PatrolZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PatrolZoneRepository extends JpaRepository<PatrolZone, UUID> {}
