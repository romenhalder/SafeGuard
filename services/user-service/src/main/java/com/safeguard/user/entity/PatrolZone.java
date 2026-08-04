package com.safeguard.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patrol_zones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatrolZone {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 100) private String zoneName;
    @Column(columnDefinition = "geometry(Polygon,4326)") private Object zoneBoundary;
    private UUID ocOfficerId;
    @Column(length = 100) private String areaName;
    @Column(length = 100) private String thanaName;
    @Column(length = 100) private String district;
    @Column(length = 100) private String state;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
