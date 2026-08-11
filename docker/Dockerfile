# ============================================
# SAFEGUARD - Multi-Stage Dockerfile
# Optimized for Spring Boot microservices
# ============================================

# ── STAGE 1: Build ──
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy parent POM first (better layer caching)
COPY pom.xml .
COPY libs/ libs/

# Copy all service POMs first for dependency resolution
COPY services/api-gateway/pom.xml services/api-gateway/
COPY services/auth-service/pom.xml services/auth-service/
COPY services/user-service/pom.xml services/user-service/
COPY services/alert-service/pom.xml services/alert-service/
COPY services/location-service/pom.xml services/location-service/
COPY services/incident-service/pom.xml services/incident-service/
COPY services/admin-service/pom.xml services/admin-service/
COPY services/notification-service/pom.xml services/notification-service/
COPY services/analytics-service/pom.xml services/analytics-service/
COPY services/service-registry/pom.xml services/service-registry/
COPY services/config-server/pom.xml services/config-server/

# Download dependencies (cached unless POMs change)
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY services/ services/

# Build specific service (passed as build arg)
ARG SERVICE_NAME
RUN mvn clean package -DskipTests -pl services/${SERVICE_NAME} -am -B

# ── STAGE 2: Runtime ──
FROM eclipse-temurin:21-jre-jammy

# Security: non-root user
RUN groupadd -r safeguard && useradd -r -g safeguard -d /app -s /sbin/nologin safeguard

WORKDIR /app

# Copy built JAR
ARG SERVICE_NAME
COPY --from=builder /app/services/${SERVICE_NAME}/target/*.jar app.jar

# Set ownership
RUN chown -R safeguard:safeguard /app

# Switch to non-root user
USER safeguard

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM options for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/tmp/heapdump.hprof \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}"

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
