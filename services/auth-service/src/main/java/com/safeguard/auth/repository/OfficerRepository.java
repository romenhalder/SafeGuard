package com.safeguard.auth.repository;

import com.safeguard.auth.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, UUID> {
    Optional<Officer> findByDepartmentId(String departmentId);
    boolean existsByDepartmentId(String departmentId);
}
