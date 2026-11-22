package com.phantomtrace.ai.agent;

import com.phantomtrace.ai.config.AIProviderConfig;
import com.phantomtrace.ai.dto.AiCompletionRequest;
import com.phantomtrace.ai.dto.StructuredAiResponse;
import com.phantomtrace.ai.provider.AiProvider;
import com.phantomtrace.ai.provider.AiProviderResult;
import com.phantomtrace.entity.Evidence;
import com.phantomtrace.entity.ExtractedIndicator;
import com.phantomtrace.entity.Investigation;
import com.phantomtrace.entity.User;
import com.phantomtrace.enums.EvidenceType;
import com.phantomtrace.enums.IndicatorType;
import com.phantomtrace.enums.InvestigationCategory;
import com.phantomtrace.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiPromptEvidenceFieldsTest {

    @Test
    @DisplayName("Assert exactly which Evidence fields and indicators are transmitted to Groq AI prompt")
    void assertAllEvidenceFieldsAndIndicatorsAreIncludedInGroqPrompt() {
        AiProvider provider = mock(AiProvider.class);
        SecurityManager securityManager = new SecurityManager();
        StructuredAiResponseParser parser = new StructuredAiResponseParser();
        AIProviderConfig config = new AIProviderConfig();
        config.setModel("llama-3.3-70b-versatile");

        // Valid mock response from Groq
        String validAiJson = """
                {
                  "agentName": "INVESTIGATION_REPORT",
                  "findings": [],
                  "indicators": [],
                  "summary": "Executive summary",
                  "limitations": []
                }
                """;
        when(provider.complete(any())).thenReturn(new AiProviderResult(
                AiProviderResult.Status.COMPLETED, "llama-3.3-70b-versatile", validAiJson, null, 10, 20));

        InvestigationReportAgent agent = new InvestigationReportAgent(provider, securityManager, parser, config);

        User user = new User("investigator@example.com", "hash", "Investigator", UserRole.ROLE_ANALYST);
        Investigation investigation = new Investigation(user, "Case", "Context", InvestigationCategory.PHISHING);
        Evidence evidence = new Evidence(investigation, EvidenceType.EMAIL, "Phishing email sample");

        // Explicit distinct marker strings for every evidence field
        String textContent = "TEXT_CONTENT_PAYLOAD_MARKER";
        String url = "https://phish-target.example.test/verify";
        String senderAddress = "malicious-sender@spoofed-bank.example.test";
        String subject = "URGENT_SECURITY_ALERT_SUBJECT";
        String emailBody = "FULL_EMAIL_BODY_CONTAINING_LURE";
        String emailHeaders = "X-Sender-IP: 198.51.100.25\nAuthentication-Results: dkim=fail";
        String normalizedContent = "OCR_OR_PDF_EXTRACTED_NORMALIZED_TEXT";

        evidence.setTextContent(textContent);
        evidence.setUrl(url);
        evidence.setSenderAddress(senderAddress);
        evidence.setSubject(subject);
        evidence.setEmailBody(emailBody);
        evidence.setEmailHeaders(emailHeaders);
        evidence.setNormalizedContent(normalizedContent);

        ExtractedIndicator ind1 = new ExtractedIndicator(evidence, IndicatorType.URL,
                url, url, "METHOD", Instant.now());
        ExtractedIndicator ind2 = new ExtractedIndicator(evidence, IndicatorType.OTP_TERM,
                "verification code", "otp", "METHOD", Instant.now());
        List<ExtractedIndicator> indicators = List.of(ind1, ind2);

        // Run agent analysis
        StructuredAiResponse response = agent.analyze(evidence, indicators);
        assertThat(response).isNotNull();

        // Capture request sent to Groq
        ArgumentCaptor<AiCompletionRequest> captor = ArgumentCaptor.forClass(AiCompletionRequest.class);
        verify(provider).complete(captor.capture());
        AiCompletionRequest capturedRequest = captor.getValue();

        String systemPrompt = capturedRequest.messages().getFirst().content();
        assertThat(capturedRequest.messages().getFirst().role()).isEqualTo("system");
        assertThat(capturedRequest.responseFormat()).containsEntry("type", "json_object");
        assertThat(systemPrompt)
                .contains("agentName", "exactly \"INVESTIGATION_REPORT\"", "findings", "indicators", "summary",
                        "limitations", "title", "description", "verificationStatus", "evidenceReference",
                        "explanation", "recommendedAction", "sourceType", "severity", "confidence", "type", "value",
                        "basis", "[LOW, MEDIUM, HIGH, CRITICAL, UNKNOWN]", "number from 0 to 1", "AI_INFERENCE",
                        "UNKNOWN", "no extra keys", "empty arrays")
                .doesNotContain(textContent, emailBody);

        String userPrompt = capturedRequest.messages().stream()
                .filter(m -> "user".equals(m.role()))
                .map(AiCompletionRequest.Message::content)
                .findFirst()
                .orElseThrow();

        // 1. Assert every Evidence field is transmitted inside the prompt
        assertThat(userPrompt).as("textContent must be included").contains(textContent);
        assertThat(userPrompt).as("url must be included").contains(url);
        assertThat(userPrompt).as("senderAddress must be included").contains(senderAddress);
        assertThat(userPrompt).as("subject must be included").contains(subject);
        assertThat(userPrompt).as("emailBody must be included").contains(emailBody);
        assertThat(userPrompt).as("emailHeaders must be included").contains(emailHeaders);
        assertThat(userPrompt).as("normalizedContent (OCR/PDF) must be included").contains(normalizedContent);

        // 2. Assert indicators are transmitted
        assertThat(userPrompt).as("Indicators must be included").contains("URL=" + url);
        assertThat(userPrompt).as("Indicators must be included").contains("OTP_TERM=otp");

        // 3. Assert untrusted containment tags are enforced
        assertThat(userPrompt).contains("<untrusted-evidence>");
        assertThat(userPrompt).contains("</untrusted-evidence>");
        assertThat(userPrompt).contains("<untrusted-deterministic-indicators>");
        assertThat(userPrompt).contains("</untrusted-deterministic-indicators>");
    }
}
