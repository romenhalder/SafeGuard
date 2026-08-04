package com.safeguard.location.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "officer_locations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerLocation {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false) private UUID officerId;
    @Column(columnDefinition = "geometry(Point,4326)", nullable = false)
    private Object location;
    @Column(nullable = false) private LocalDateTime recordedAt;
}
