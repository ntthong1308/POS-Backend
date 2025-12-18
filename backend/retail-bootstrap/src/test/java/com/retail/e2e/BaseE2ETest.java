package com.retail.e2e;

import com.retail.bootstrap.BaseIntegrationTest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for E2E tests
 * Extends BaseIntegrationTest and adds REST Assured configuration
 *
 * @author ntthong1308
 * @since 2025-12-01
 */
@ActiveProfiles("test")
public abstract class BaseE2ETest extends BaseIntegrationTest {

    @LocalServerPort
    protected int port;

    @BeforeEach
    void setUpRestAssured() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
        RestAssured.basePath = "";
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    /**
     * Get authentication token (override in subclasses if needed)
     */
    protected String getAuthToken() {
        // Return empty for public endpoints or override for authenticated endpoints
        return null;
    }

    /**
     * Create authenticated request
     */
    protected io.restassured.specification.RequestSpecification givenAuth() {
        io.restassured.specification.RequestSpecification request = io.restassured.RestAssured.given()
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON);

        String token = getAuthToken();
        if (token != null && !token.isEmpty()) {
            request.header("Authorization", "Bearer " + token);
        }

        return request;
    }
}

