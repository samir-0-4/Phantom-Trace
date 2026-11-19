package com.phantomtrace.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointReturnsUpAndApplicationName() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("PhantomTrace"));
    }

    @Test
    void actuatorHealthBridgeReturnsUpAndMatchesCanonicalResponse() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("PhantomTrace"));
    }

    @Test
    void healthEndpointReturns503WhenDatabaseFails() {
        jakarta.persistence.EntityManager failingEm = org.mockito.Mockito.mock(jakarta.persistence.EntityManager.class);
        org.mockito.Mockito.when(failingEm.createNativeQuery(org.mockito.ArgumentMatchers.anyString()))
                .thenThrow(new jakarta.persistence.PersistenceException("Simulated DB connection failure"));
        HealthController controller = new HealthController(failingEm);

        org.springframework.http.ResponseEntity<com.phantomtrace.dto.HealthResponse> response = controller.getHealth();
        org.junit.jupiter.api.Assertions.assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        org.junit.jupiter.api.Assertions.assertNotNull(response.getBody());
        org.junit.jupiter.api.Assertions.assertEquals("DEGRADED", response.getBody().status());
        org.junit.jupiter.api.Assertions.assertFalse(response.getBody().dbConnected());
    }
}

