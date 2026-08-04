package com.safeguard.incident.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "incident_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentLog {

    @Id
    private String id;

    @Indexed(unique = true)
    private String incidentId;

    @Builder.Default
    private List<IncidentEvent> events = new ArrayList<>();

    @Indexed
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncidentEvent {
        private String event;
        private LocalDateTime timestamp;
        private Object data;
    }
}
