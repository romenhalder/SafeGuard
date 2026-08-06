package com.safeguard.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "officers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Officer {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true, length = 50) private String departmentId;
    @Column(nullable = false, length = 100) private String name;
    @Column(length = 50) private String rank;
    @Column(nullable = false, length = 15) private String phone;
    @Column(length = 30) private String badgeNumber;
    @Column(length = 20) private String dutyStatus;
    @Column(columnDefinition = "geometry(Point,4326)") private Object currentLocation;
    private LocalDateTime lastLocationUpdate;
    @Column(name = "is_active", nullable = false) private boolean active;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
