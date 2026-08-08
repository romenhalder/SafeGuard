package com.safeguard.admin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Polygon;

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
    @JsonIgnore
    @Column(columnDefinition = "geometry(Polygon,4326)") private Polygon zoneBoundary;
    private UUID ocOfficerId;
    @Column(length = 100) private String areaName;
    @Column(length = 100) private String thanaName;
    @Column(length = 100) private String district;
    @Column(length = 100) private String state;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;

    public String getBoundaryGeoJson() {
        if (zoneBoundary == null || zoneBoundary.getExteriorRing() == null) return null;
        Coordinate[] coords = zoneBoundary.getExteriorRing().getCoordinates();
        StringBuilder rings = new StringBuilder("[");
        for (int i = 0; i < coords.length; i++) {
            if (i > 0) rings.append(",");
            rings.append("[").append(coords[i].x).append(",").append(coords[i].y).append("]");
        }
        rings.append("]");
        return "{\"type\":\"Polygon\",\"coordinates\":[" + rings + "]}";
    }
}
