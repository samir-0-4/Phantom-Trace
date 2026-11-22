package com.phantomtrace.ai.agent;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.phantomtrace.ai.dto.AiFinding;
import com.phantomtrace.ai.dto.StructuredAiResponse;
import com.phantomtrace.enums.EpistemicStatus;
import com.phantomtrace.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StructuredAiResponseParser {
    private final ObjectMapper mapper = JsonMapper.builder()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true).build();

    public StructuredAiResponse parse(String json, String expectedAgent) {
        try {
            StructuredAiResponse result = mapper.readValue(json, StructuredAiResponse.class);
            if (result.agentName() == null || !expectedAgent.equals(result.agentName())
                    || result.findings() == null || result.indicators() == null
                    || result.limitations() == null) {
                throw invalid();
            }
            List<AiFinding> findings = result.findings().stream().map(this::validatedModelFinding).toList();
            return new StructuredAiResponse(result.agentName(), findings, result.indicators(), result.summary(),
                    result.limitations());
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw invalid();
        }
    }

    private AiFinding validatedModelFinding(AiFinding finding) {
        if (finding.title() == null || finding.description() == null
                || finding.severity() == null || finding.confidence() < 0
                || finding.confidence() > 1 || finding.evidenceReference() == null
                || finding.explanation() == null || finding.recommendedAction() == null
                || finding.sourceType() == null) {
            throw invalid();
        }

        String verification = EpistemicStatus.AI_INFERENCE.name().equals(finding.verificationStatus())
                ? EpistemicStatus.AI_INFERENCE.name() : EpistemicStatus.UNKNOWN.name();
        return new AiFinding(finding.title(), finding.description(), finding.severity(), finding.confidence(),
                verification, finding.evidenceReference(), finding.explanation(), finding.recommendedAction(), "AI");
    }

    private ApiException invalid() {
        return new ApiException("AI response failed structured schema validation", HttpStatus.BAD_GATEWAY);
    }
}
