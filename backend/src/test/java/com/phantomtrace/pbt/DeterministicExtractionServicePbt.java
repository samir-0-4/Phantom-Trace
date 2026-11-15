package com.phantomtrace.pbt;

import com.phantomtrace.dto.evidence.ExtractedIndicatorResponse;
import com.phantomtrace.entity.Evidence;
import com.phantomtrace.entity.ExtractedIndicator;
import com.phantomtrace.entity.Investigation;
import com.phantomtrace.entity.User;
import com.phantomtrace.enums.EvidenceType;
import com.phantomtrace.enums.InvestigationCategory;
import com.phantomtrace.enums.UserRole;
import com.phantomtrace.repository.ExtractedIndicatorRepository;
import com.phantomtrace.service.DeterministicExtractionService;
import com.phantomtrace.service.UrlNormalizationService;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DeterministicExtractionServicePbt {

    @Property(tries = 500)
    void extractionNeverThrowsAndYieldsWellFormedIndicators(@ForAll("arbitraryPayloads") String payload) {
        ExtractedIndicatorRepository repository = mock(ExtractedIndicatorRepository.class);
        when(repository.save(any())).thenAnswer(invocation -> {
            ExtractedIndicator ind = invocation.getArgument(0);
            ReflectionTestUtils.setField(ind, "id", UUID.randomUUID());
            return ind;
        });

        DeterministicExtractionService service = new DeterministicExtractionService(
                repository, new UrlNormalizationService());

        User user = new User("pbt@example.com", "hash", "Pbt User", UserRole.ROLE_ANALYST);
        Investigation investigation = new Investigation(user, "Case", "Context", InvestigationCategory.PHISHING);
        Evidence evidence = new Evidence(investigation, EvidenceType.TEXT_MESSAGE, "Test Evidence");
        evidence.setTextContent(payload);
        ReflectionTestUtils.setField(evidence, "id", UUID.randomUUID());

        assertThatCode(() -> {
            List<ExtractedIndicatorResponse> responses = service.extractAndPersist(evidence);

            for (ExtractedIndicatorResponse indicator : responses) {
                // Must have non-null fields
                assertThat(indicator.indicatorType()).isNotNull();
                assertThat(indicator.originalValue()).isNotNull().isNotBlank();
                assertThat(indicator.normalizedValue()).isNotNull().isNotBlank();
                assertThat(indicator.extractionMethod()).isNotNull();
                assertThat(indicator.evidenceId()).isEqualTo(evidence.getId());
            }
        }).doesNotThrowAnyException();
    }

    @Provide
    Arbitrary<String> arbitraryPayloads() {
        return Arbitraries.oneOf(
                Arbitraries.strings().all().ofMinLength(0).ofMaxLength(10000),
                Arbitraries.strings().ascii().ofMinLength(0).ofMaxLength(20000),
                // Strings with null bytes and control chars
                Arbitraries.strings().withChars("abc123 \n\r\t\u0000\u0001\u001f<>&\"'").ofMinLength(1).ofMaxLength(500),
                // Potential URLs and emails mixed with noise
                Arbitraries.strings().withChars("https://example.com/login?token=abc@test.com 192.168.1.1 pay fee urgent otp \u0000")
                        .ofMinLength(5).ofMaxLength(1000)
        );
    }
}

