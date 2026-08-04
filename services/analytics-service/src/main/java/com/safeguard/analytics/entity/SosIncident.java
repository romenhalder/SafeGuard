package com.safeguard.analytics.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sos_incidents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SosIncident {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false) private UUID citizenId;
    @Column(length = 50) private String incidentType;
    @Column(columnDefinition = "geometry(Point,4326)", nullable = false) private Object location;
    @Column(length = 30) private String status;
    @Column(length = 20) private String priority;
    private UUID assignedOfficerId;
    private LocalDateTime alertSentAt;
    private LocalDateTime officerAcceptedAt;
    private LocalDateTime officerArrivedAt;
    private LocalDateTime resolvedAt;
    private Integer citizenRating;
    private LocalDateTime createdAt;
}
