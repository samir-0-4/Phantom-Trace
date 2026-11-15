package com.phantomtrace.dto.risk;

import com.phantomtrace.entity.RiskContribution;
import java.util.UUID;

public record RiskContributionResponse(UUID id, String signalKey, String signal, int weight,
        String evidenceReferences, String explanation, String epistemicBasis) {

    public RiskContributionResponse(UUID id, String signalKey, String signal, int weight,
            String evidenceReferences, String explanation) {
        this(id, signalKey, signal, weight, evidenceReferences, explanation,
                signalKey != null && signalKey.startsWith("IMPERSONATION") ? "AI_INFERENCE" : "VERIFIED");
    }

    public static RiskContributionResponse fromEntity(RiskContribution value) {
        String epistemicBasis = value.getSignalKey() != null && value.getSignalKey().startsWith("IMPERSONATION")
                ? "AI_INFERENCE"
                : "VERIFIED";
        return new RiskContributionResponse(value.getId(), value.getSignalKey(), value.getSignal(),
                value.getWeight(), value.getEvidenceReferences(), value.getExplanation(), epistemicBasis);
    }
}
