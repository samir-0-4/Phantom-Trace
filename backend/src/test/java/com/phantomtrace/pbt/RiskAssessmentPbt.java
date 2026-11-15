package com.phantomtrace.pbt;

import com.phantomtrace.ai.config.RiskAssessmentProperties;
import com.phantomtrace.dto.risk.RiskAssessmentResponse;
import com.phantomtrace.entity.*;
import com.phantomtrace.enums.*;
import com.phantomtrace.repository.*;
import com.phantomtrace.security.SecurityUtils;
import com.phantomtrace.service.RiskAssessmentService;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;
import net.jqwik.api.constraints.IntRange;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RiskAssessmentPbt {

    @Property(tries = 300)
    void riskScoreIsAlwaysBoundedBetweenZeroAndOneHundred(
            @ForAll @IntRange(min = 0, max = 5) int paymentCount,
            @ForAll @IntRange(min = 0, max = 5) int credentialCount,
            @ForAll @IntRange(min = 0, max = 5) int otpCount,
            @ForAll @IntRange(min = 0, max = 5) int urgencyCount,
            @ForAll boolean includeUnusualUrl,
            @ForAll boolean includeVerifiedThreat) {

        UUID userId = UUID.randomUUID();
        UUID investigationId = UUID.randomUUID();

        InvestigationRepository invRepo = mock(InvestigationRepository.class);
        EvidenceRepository evRepo = mock(EvidenceRepository.class);
        ExtractedIndicatorRepository extRepo = mock(ExtractedIndicatorRepository.class);
        ThreatIndicatorRepository threatRepo = mock(ThreatIndicatorRepository.class);
        ThreatLookupRepository lookupRepo = mock(ThreatLookupRepository.class);
        RiskAssessmentRepository assessRepo = mock(RiskAssessmentRepository.class);
        RiskContributionRepository contribRepo = mock(RiskContributionRepository.class);
        SecurityUtils secUtils = mock(SecurityUtils.class);

        User user = new User("user@example.com", "hash", "User", UserRole.ROLE_ANALYST);
        ReflectionTestUtils.setField(user, "id", userId);
        Investigation investigation = new Investigation(user, "Title", "Desc", InvestigationCategory.PHISHING);
        ReflectionTestUtils.setField(investigation, "id", investigationId);

        when(secUtils.getCurrentUserId()).thenReturn(userId);
        when(invRepo.findById(investigationId)).thenReturn(Optional.of(investigation));
        when(assessRepo.save(any())).thenAnswer(inv -> {
            RiskAssessment a = inv.getArgument(0);
            ReflectionTestUtils.setField(a, "id", UUID.randomUUID());
            return a;
        });
        lenient().when(contribRepo.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        Evidence evidence = new Evidence(investigation, EvidenceType.TEXT_MESSAGE, "Sample");
        ReflectionTestUtils.setField(evidence, "id", UUID.randomUUID());
        evidence.setTextContent("Sample text");
        when(evRepo.findByInvestigationIdOrderByCreatedAtDesc(investigationId)).thenReturn(List.of(evidence));

        List<ExtractedIndicator> indicators = new ArrayList<>();
        for (int i = 0; i < paymentCount; i++) {
            indicators.add(new ExtractedIndicator(evidence, IndicatorType.PAYMENT_TERM, "pay" + i, "pay", "METHOD", Instant.now()));
        }
        for (int i = 0; i < credentialCount; i++) {
            indicators.add(new ExtractedIndicator(evidence, IndicatorType.CREDENTIAL_TERM, "pass" + i, "password", "METHOD", Instant.now()));
        }
        for (int i = 0; i < otpCount; i++) {
            indicators.add(new ExtractedIndicator(evidence, IndicatorType.OTP_TERM, "otp" + i, "otp", "METHOD", Instant.now()));
        }
        for (int i = 0; i < urgencyCount; i++) {
            indicators.add(new ExtractedIndicator(evidence, IndicatorType.URGENCY_INDICATOR, "urgent" + i, "urgent", "METHOD", Instant.now()));
        }
        if (includeUnusualUrl) {
            indicators.add(new ExtractedIndicator(evidence, IndicatorType.URL, "http://192.168.1.1/login", "http://192.168.1.1/login", "METHOD", Instant.now()));
        }
        when(extRepo.findByEvidenceInvestigationId(investigationId)).thenReturn(indicators);

        if (includeVerifiedThreat) {
            ThreatIndicator threat = new ThreatIndicator(investigation, IndicatorType.URL,
                    "http://malicious.test", "http://malicious.test", evidence, "VERIFIED_MALICIOUS", Instant.now());
            when(threatRepo.findByInvestigationId(investigationId)).thenReturn(List.of(threat));
        } else {
            when(threatRepo.findByInvestigationId(investigationId)).thenReturn(List.of());
        }

        RiskAssessmentProperties properties = new RiskAssessmentProperties();
        RiskAssessmentService service = new RiskAssessmentService(
                invRepo, evRepo, extRepo, threatRepo, lookupRepo, assessRepo, contribRepo, secUtils, properties);

        RiskAssessmentResponse response = service.assess(investigationId);

        // Core Invariant: Score is always between 0 and 100 inclusive
        assertThat(response.score()).isGreaterThanOrEqualTo(0);
        assertThat(response.score()).isLessThanOrEqualTo(100);

        // Category invariants
        if (indicators.isEmpty()) {
            assertThat(response.category()).isEqualTo(RiskCategory.INCONCLUSIVE);
        } else if (response.score() <= 19) {
            assertThat(response.category()).isEqualTo(RiskCategory.LOW);
        } else if (response.score() <= 39) {
            assertThat(response.category()).isEqualTo(RiskCategory.MODERATE);
        } else if (response.score() <= 69) {
            assertThat(response.category()).isEqualTo(RiskCategory.HIGH);
        } else {
            assertThat(response.category()).isEqualTo(RiskCategory.CRITICAL);
        }
    }
}

