package com.phantomtrace.ai.agent;

import com.phantomtrace.ai.dto.AiFinding;
import com.phantomtrace.enums.SeverityLevel;
import com.phantomtrace.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StructuredAiResponseParserTest {
    private final StructuredAiResponseParser parser = new StructuredAiResponseParser();

    @Test
    void rejectsMalformedAndUnexpectedStructuredResponses() {
        assertThatThrownBy(() -> parser.parse("not-json", "TEXT_DETECTIVE"))
                .isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> parser.parse("""
                {"agentName":"TEXT_DETECTIVE","findings":[{"title":"x","description":"y","severity":"HIGH",
                "confidence":2,"verificationStatus":"UNVERIFIED","evidenceReference":"e1",
                "explanation":"z","recommendedAction":"a","sourceType":"AI"}],"indicators":[],"summary":"",
                "limitations":[]}
                """, "TEXT_DETECTIVE")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> parser.parse("""
                {"agentName":"OTHER","findings":[],"indicators":[],"summary":"","limitations":[]}
                """, "TEXT_DETECTIVE")).isInstanceOf(ApiException.class);
    }

    @ParameterizedTest
    @CsvSource({
            "AI_INFERENCE, AI_INFERENCE",
            "UNKNOWN, UNKNOWN",
            "VERIFIED, UNKNOWN",
            "EXTERNALLY_VERIFIED, UNKNOWN",
            "UNVERIFIED, UNKNOWN",
            ", UNKNOWN"
    })
    void keepsModelFindingsWithinTheAiVerificationBoundary(String claimedStatus, String expectedStatus) {
        String verificationField = claimedStatus == null ? "" : "\"verificationStatus\":\"" + claimedStatus + "\",";
        String json = """
                {"agentName":"TEXT_DETECTIVE","findings":[{
                  "title":"Synthetic signal","description":"A reserved indicator appeared.","severity":"LOW",
                  "confidence":0.75,%s"evidenceReference":"message text","explanation":"Fixture explanation",
                  "recommendedAction":"Review the source evidence.","sourceType":"EXTERNAL_INTELLIGENCE"
                }],"indicators":[],"summary":"Fixture summary","limitations":[]}
                """.formatted(verificationField);

        assertThat(parser.parse(json, "TEXT_DETECTIVE").findings()).containsExactly(new AiFinding(
                "Synthetic signal", "A reserved indicator appeared.", SeverityLevel.LOW, 0.75, expectedStatus,
                "message text", "Fixture explanation", "Review the source evidence.", "AI"));
    }
}
