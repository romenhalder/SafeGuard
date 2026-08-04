package com.safeguard.admin.repository;

import com.safeguard.admin.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, UUID>, JpaSpecificationExecutor<Officer> {
    List<Officer> findByDutyStatus(String dutyStatus);
    long countByDutyStatus(String dutyStatus);
}
