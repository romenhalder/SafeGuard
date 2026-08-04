package com.safeguard.auth.repository;

import com.safeguard.auth.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, UUID> {
    Optional<Citizen> findByPhone(String phone);
    boolean existsByPhone(String phone);
    Optional<Citizen> findByEmail(String email);
}
