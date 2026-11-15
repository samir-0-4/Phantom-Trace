package com.phantomtrace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.phantomtrace.dto.campaign.CampaignReconstructionResponse;
import com.phantomtrace.dto.graph.InvestigationGraphResponse;
import com.phantomtrace.dto.report.InvestigationReportResponse;
import com.phantomtrace.dto.risk.RiskAssessmentResponse;
import com.phantomtrace.entity.*;
import com.phantomtrace.enums.*;
import com.phantomtrace.repository.*;
import com.phantomtrace.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvestigationReportServiceTest {

    @Mock private InvestigationRepository investigationRepository;
    @Mock private EvidenceRepository evidenceRepository;
    @Mock private ExtractedIndicatorRepository indicatorRepository;
    @Mock private ThreatLookupRepository lookupRepository;
    @Mock private AgentExecutionRepository executionRepository;
    @Mock private EvidenceRelationshipRepository relationshipRepository;
    @Mock private RiskAssessmentService riskAssessmentService;
    @Mock private CorrelationOrchestrator correlationOrchestrator;
    @Mock private InvestigationReportRepository reportRepository;
    @Mock private SecurityUtils securityUtils;
    @Mock private CampaignReconstructionService campaignReconstructionService;

    private ObjectMapper objectMapper;
    private InvestigationReportService reportService;
    private UUID userId;
    private UUID investigationId;
    private Investigation investigation;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        userId = UUID.randomUUID();
        investigationId = UUID.randomUUID();

        User user = new User("investigator@example.com", "hash", "Investigator", UserRole.ROLE_ANALYST);
        ReflectionTestUtils.setField(user, "id", userId);

        investigation = new Investigation(user, "Phishing Dossier #104", "Suspicious banking email", InvestigationCategory.PHISHING);
        ReflectionTestUtils.setField(investigation, "id", investigationId);
        investigation.setRiskScore(65.0);
        investigation.setOverallRiskLevel(SeverityLevel.HIGH);

        lenient().when(securityUtils.getCurrentUserId()).thenReturn(userId);
        lenient().when(investigationRepository.findById(investigationId)).thenReturn(Optional.of(investigation));
        lenient().when(reportRepository.save(any(InvestigationReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        reportService = new InvestigationReportService(
                investigationRepository, evidenceRepository, indicatorRepository,
                lookupRepository, executionRepository, relationshipRepository,
                riskAssessmentService, correlationOrchestrator, reportRepository,
                objectMapper, securityUtils, campaignReconstructionService
        );
    }

    @Test
    void generatesRealSha256DigestWithLength64AndDetectsContentChange() throws Exception {
        Evidence ev1 = new Evidence(investigation, EvidenceType.EMAIL, "Phish email 1");
        ReflectionTestUtils.setField(ev1, "id", UUID.randomUUID());
        ev1.setSenderAddress("security@fakebank.com");
        ev1.setSubject("Urgent: Account Locked");

        when(evidenceRepository.findByInvestigationIdOrderByCreatedAtDesc(investigationId)).thenReturn(List.of(ev1));
        when(indicatorRepository.findByEvidenceIdOrderByExtractedAtAsc(any())).thenReturn(List.of());
        when(lookupRepository.findByIndicatorEvidenceIdOrderByLookupTimestampDesc(any())).thenReturn(List.of());
        when(executionRepository.findByEvidenceIdOrderByCompletedAtDesc(any())).thenReturn(List.of());
        when(correlationOrchestrator.getGraph(investigationId)).thenReturn(new InvestigationGraphResponse(investigationId.toString(), List.of(), List.of()));
        when(campaignReconstructionService.reconstruct(investigationId)).thenReturn(new CampaignReconstructionResponse(
                List.of(), List.of(), List.of(), "ISOLATED_INCIDENT", "No cross-case links", 0, 0));

        InvestigationReportResponse response = reportService.create(investigationId);

        assertThat(response).isNotNull();
        assertThat(response.contentJson()).isNotBlank();

        Map<?, ?> parsed = objectMapper.readValue(response.contentJson(), Map.class);
        String integrityDigest = (String) parsed.get("integrityDigest");

        // Assert digest length is exactly 64 hex characters (SHA-256)
        assertThat(integrityDigest).isNotNull();
        assertThat(integrityDigest).hasSize(64);
        assertThat(integrityDigest).matches("^[a-f0-9]{64}$");

        // Assert that SHA-256 changes when content changes
        String initialDigest = integrityDigest;

        // Change content: add a second evidence item
        Evidence ev2 = new Evidence(investigation, EvidenceType.TEXT_MESSAGE, "SMS alert");
        ReflectionTestUtils.setField(ev2, "id", UUID.randomUUID());
        ev2.setSenderAddress("+15551234567");
        when(evidenceRepository.findByInvestigationIdOrderByCreatedAtDesc(investigationId)).thenReturn(List.of(ev1, ev2));

        InvestigationReportResponse response2 = reportService.create(investigationId);
        Map<?, ?> parsed2 = objectMapper.readValue(response2.contentJson(), Map.class);
        String updatedDigest = (String) parsed2.get("integrityDigest");

        assertThat(updatedDigest).hasSize(64);
        assertThat(updatedDigest).matches("^[a-f0-9]{64}$");
        assertThat(updatedDigest).isNotEqualTo(initialDigest);
    }

    @Test
    void includesDeterministicExecutiveSummaryWhenAiAnalysisNotRun() throws Exception {
        Evidence ev = new Evidence(investigation, EvidenceType.EMAIL, "Phish email");
        ReflectionTestUtils.setField(ev, "id", UUID.randomUUID());
        ev.setSenderAddress("alerts@bank.test");

        when(evidenceRepository.findByInvestigationIdOrderByCreatedAtDesc(investigationId)).thenReturn(List.of(ev));
        when(indicatorRepository.findByEvidenceIdOrderByExtractedAtAsc(any())).thenReturn(List.of());
        when(lookupRepository.findByIndicatorEvidenceIdOrderByLookupTimestampDesc(any())).thenReturn(List.of());
        when(executionRepository.findByEvidenceIdOrderByCompletedAtDesc(any())).thenReturn(List.of()); // No AI runs
        when(correlationOrchestrator.getGraph(investigationId)).thenReturn(new InvestigationGraphResponse(investigationId.toString(), List.of(), List.of()));
        when(campaignReconstructionService.reconstruct(investigationId)).thenReturn(new CampaignReconstructionResponse(
                List.of(), List.of(), List.of(), "ISOLATED_INCIDENT", "Isolated", 0, 0));

        InvestigationReportResponse response = reportService.create(investigationId);
        Map<?, ?> parsed = objectMapper.readValue(response.contentJson(), Map.class);

        assertThat(parsed.get("deterministicExecutiveSummary")).isNotNull();
        String summary = (String) parsed.get("deterministicExecutiveSummary");
        assertThat(summary).contains("Deterministic forensic baseline");
        assertThat(summary).contains("AI multi-agent reasoning was not executed");
    }

    @Test
    void computeSha256HexProducesCorrectHash() {
        String input = "test-canonical-content";
        String hash = InvestigationReportService.computeSha256Hex(input);
        assertThat(hash).hasSize(64);
        assertThat(hash).isEqualTo(InvestigationReportService.computeSha256Hex(input));
        assertThat(hash).isNotEqualTo(InvestigationReportService.computeSha256Hex("different-content"));
    }
}
