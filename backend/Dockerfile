# =============================================
# Multi-stage Dockerfile for Retail Platform
# =============================================

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom files first (for better layer caching)
COPY pom.xml .
COPY retail-common/pom.xml retail-common/
COPY retail-domain/pom.xml retail-domain/
COPY retail-persistence/pom.xml retail-persistence/
COPY retail-security/pom.xml retail-security/
COPY retail-application/pom.xml retail-application/
COPY retail-api/pom.xml retail-api/
COPY retail-pos-api/pom.xml retail-pos-api/
COPY retail-admin-api/pom.xml retail-admin-api/
COPY retail-migrations/pom.xml retail-migrations/
COPY retail-bootstrap/pom.xml retail-bootstrap/

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY retail-common/src retail-common/src
COPY retail-domain/src retail-domain/src
COPY retail-persistence/src retail-persistence/src
COPY retail-security/src retail-security/src
COPY retail-application/src retail-application/src
COPY retail-api/src retail-api/src
COPY retail-pos-api/src retail-pos-api/src
COPY retail-admin-api/src retail-admin-api/src
COPY retail-migrations/src retail-migrations/src
COPY retail-bootstrap/src retail-bootstrap/src

# Build application (skip tests for faster build)
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy JAR from build stage
COPY --from=build /app/retail-bootstrap/target/retail-bootstrap-*.jar app.jar

# Install curl for health check (before switching to non-root user)
RUN apk add --no-cache curl

# Change ownership
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring:spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", \
  "app.jar"]

