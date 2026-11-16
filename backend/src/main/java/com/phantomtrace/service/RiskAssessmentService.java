package com.phantomtrace.service;

import com.phantomtrace.ai.config.RiskAssessmentProperties;
import com.phantomtrace.dto.risk.RiskAssessmentResponse;
import com.phantomtrace.dto.risk.RiskContributionResponse;
import com.phantomtrace.entity.Evidence;
import com.phantomtrace.entity.ExtractedIndicator;
import com.phantomtrace.entity.Investigation;
import com.phantomtrace.entity.RiskAssessment;
import com.phantomtrace.entity.RiskContribution;
import com.phantomtrace.entity.ThreatIndicator;
import com.phantomtrace.enums.RiskCategory;
import com.phantomtrace.enums.SeverityLevel;
import com.phantomtrace.enums.ThreatStatus;
import com.phantomtrace.exception.ApiException;
import com.phantomtrace.repository.AgentExecutionRepository;
import com.phantomtrace.repository.EvidenceRepository;
import com.phantomtrace.repository.ExtractedIndicatorRepository;
import com.phantomtrace.repository.InvestigationRepository;
import com.phantomtrace.repository.RiskAssessmentRepository;
import com.phantomtrace.repository.RiskContributionRepository;
import com.phantomtrace.repository.ThreatIndicatorRepository;
import com.phantomtrace.repository.ThreatLookupRepository;
import com.phantomtrace.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class RiskAssessmentService {

    private final InvestigationRepository investigationRepository;
    private final EvidenceRepository evidenceRepository;
    private final ExtractedIndicatorRepository extractedRepository;
    private final ThreatIndicatorRepository threatIndicatorRepository;
    private final ThreatLookupRepository lookupRepository;
    private final RiskAssessmentRepository assessmentRepository;
    private final RiskContributionRepository contributionRepository;
    private final SecurityUtils securityUtils;
    private final RiskAssessmentProperties properties;
    private final AgentExecutionRepository executionRepository;

    @Autowired
    public RiskAssessmentService(InvestigationRepository investigationRepository, EvidenceRepository evidenceRepository,
            ExtractedIndicatorRepository extractedRepository, ThreatIndicatorRepository threatIndicatorRepository,
            ThreatLookupRepository lookupRepository, RiskAssessmentRepository assessmentRepository,
            RiskContributionRepository contributionRepository, SecurityUtils securityUtils,
            RiskAssessmentProperties properties,
            @Autowired(required = false) AgentExecutionRepository executionRepository) {
        this.investigationRepository = investigationRepository;
        this.evidenceRepository = evidenceRepository;
        this.extractedRepository = extractedRepository;
        this.threatIndicatorRepository = threatIndicatorRepository;
        this.lookupRepository = lookupRepository;
        this.assessmentRepository = assessmentRepository;
        this.contributionRepository = contributionRepository;
        this.securityUtils = securityUtils;
        this.properties = properties;
        this.executionRepository = executionRepository;
    }

    public RiskAssessmentService(InvestigationRepository investigationRepository, EvidenceRepository evidenceRepository,
            ExtractedIndicatorRepository extractedRepository, ThreatIndicatorRepository threatIndicatorRepository,
            ThreatLookupRepository lookupRepository, RiskAssessmentRepository assessmentRepository,
            RiskContributionRepository contributionRepository, SecurityUtils securityUtils,
            RiskAssessmentProperties properties) {
        this(investigationRepository, evidenceRepository, extractedRepository, threatIndicatorRepository,
                lookupRepository, assessmentRepository, contributionRepository, securityUtils, properties, null);
    }

    public RiskAssessmentResponse assess(UUID investigationId) {
        Investigation investigation = owned(investigationId);
        List<Evidence> evidence = evidenceRepository.findByInvestigationIdOrderByCreatedAtDesc(investigationId);
        List<ExtractedIndicator> indicators = extractedRepository.findByEvidenceInvestigationId(investigationId);
        List<Signal> signals = signals(investigationId, indicators);
        int score = Math.max(0, Math.min(100, signals.stream().mapToInt(Signal::weight).sum()));

        boolean hasConclusiveThreatIntel = indicators.stream().anyMatch(item ->
                lookupRepository.findByIndicatorId(item.getId()).stream()
                        .anyMatch(l -> l.getThreatStatus() == ThreatStatus.MALICIOUS
                                || l.getThreatStatus() == ThreatStatus.SUSPICIOUS
                                || l.getThreatStatus() == ThreatStatus.NO_MALICIOUS_RESULT));

        boolean hasAiAnalysis = false;
        if (executionRepository != null) {
            hasAiAnalysis = evidence.stream().anyMatch(ev ->
                    executionRepository.findByEvidenceIdOrderByCompletedAtDesc(ev.getId()).stream()
                            .anyMatch(exec -> "SUCCESS".equalsIgnoreCase(exec.getExecutionStatus())
                                    && exec.getOutputJson() != null && !exec.getOutputJson().isBlank()));
        }

        double confidence = confidence(evidence, indicators, hasConclusiveThreatIntel, hasAiAnalysis);
        RiskCategory category = evidence.isEmpty() || indicators.isEmpty()
                ? RiskCategory.INCONCLUSIVE : category(score);
        String missing = missingInformation(evidence, indicators, hasConclusiveThreatIntel, hasAiAnalysis);
        String explanation = explanation(score, category, signals, confidence, hasConclusiveThreatIntel, hasAiAnalysis);
        RiskAssessment assessment = assessmentRepository.save(new RiskAssessment(investigation, score, category,
                confidence, missing, explanation, Instant.now()));
        List<RiskContribution> contributions = signals.stream().map(signal -> new RiskContribution(assessment,
                signal.key(), signal.label(), signal.weight(), signal.evidenceReferences(), signal.explanation())).toList();
        contributionRepository.saveAll(contributions);

        investigation.setRiskScore((double) score);
        investigation.setOverallRiskLevel(category == RiskCategory.INCONCLUSIVE ? SeverityLevel.UNKNOWN : switch (category) {
            case LOW -> SeverityLevel.LOW;
            case MODERATE -> SeverityLevel.MEDIUM;
            case HIGH -> SeverityLevel.HIGH;
            case CRITICAL -> SeverityLevel.CRITICAL;
            case INCONCLUSIVE -> SeverityLevel.UNKNOWN;
        });
        investigationRepository.save(investigation);
        return RiskAssessmentResponse.fromEntity(assessment,
                contributions.stream().map(RiskContributionResponse::fromEntity).toList());
    }

    @Transactional(readOnly = true)
    public RiskAssessmentResponse latest(UUID investigationId) {
        owned(investigationId);
        RiskAssessment assessment = assessmentRepository.findTopByInvestigationIdOrderByAssessedAtDesc(investigationId)
                .orElseThrow(() -> new ApiException("Risk assessment not found", HttpStatus.NOT_FOUND));
        return RiskAssessmentResponse.fromEntity(assessment, contributionRepository
                .findByAssessmentIdOrderByWeightDesc(assessment.getId()).stream()
                .map(RiskContributionResponse::fromEntity).toList());
    }

    private List<Signal> signals(UUID investigationId, List<ExtractedIndicator> indicators) {
        Map<String, Signal> unique = new LinkedHashMap<>();
        for (ExtractedIndicator indicator : indicators) {
            String ref = indicator.getEvidence().getId().toString();
            String value = indicator.getNormalizedValue() != null ? indicator.getNormalizedValue() : "";
            String lowerVal = value.toLowerCase(Locale.ROOT);
            switch (indicator.getIndicatorType()) {
                case CREDENTIAL_TERM, OTP_TERM -> add(unique, "CREDENTIAL_OTP",
                        "Credential or OTP request", properties.getCredentialOtpWeight(), ref,
                        "A deterministic credential or OTP-related indicator was extracted.");
                case PAYMENT_TERM, MESSAGE_SIGNAL -> {
                    if (lowerVal.contains("pay") || lowerVal.contains("payment") || lowerVal.contains("fee")
                            || lowerVal.contains("transfer") || lowerVal.contains("deposit")
                            || lowerVal.contains("refund")
                            || lowerVal.contains("registration_fee") || lowerVal.contains("processing_fee")) {
                        add(unique, "PAYMENT", "Payment / Wire / Fee Request",
                                properties.getUpfrontPaymentWeight(), ref,
                                "A deterministic payment-related indicator was extracted.");
                    }
                    if (lowerVal.contains("impersonation")) {
                        add(unique, "IMPERSONATION", "Impersonation / Spoofing Signal",
                                properties.getImpersonationWeight(), ref,
                                "An impersonation signal was detected.");
                    }
                    if (lowerVal.contains("urgency") || lowerVal.contains("pressure")) {
                        add(unique, "URGENCY", "Urgency & Pressure Language",
                                properties.getUrgencyWeight(), ref,
                                "A deterministic urgency or pressure signal was extracted.");
                    }
                }
                case URGENCY_INDICATOR -> add(unique, "URGENCY", "Urgency & Pressure Language",
                        properties.getUrgencyWeight(), ref, "Urgency language was deterministically extracted.");
                case URL -> {
                    if (unusualUrl(value)) add(unique, "UNUSUAL_URL", "Unusual URL / Path Obfuscation",
                            properties.getUnusualUrlWeight(), ref,
                            "The URL has an unusual characteristic such as an IP host, punycode, or suspicious path.");
                }
                default -> { }
            }
        }
        for (ThreatIndicator indicator : threatIndicatorRepository.findByInvestigationId(investigationId)) {
            if ("VERIFIED_MALICIOUS".equals(indicator.getExternalVerificationStatus())) {
                add(unique, "MALICIOUS", "Verified Malicious Intel",
                        properties.getVerifiedMaliciousWeight(), indicator.getSourceEvidence().getId().toString(),
                        "External threat intelligence marked this normalized indicator malicious or suspicious.");
            }
        }
        return new ArrayList<>(unique.values());
    }

    private void add(Map<String, Signal> unique, String key, String label, int weight, String evidenceReference,
            String explanation) {
        unique.compute(key, (ignored, existing) -> existing == null
                ? new Signal(key, label, weight, new LinkedHashSet<>(List.of(evidenceReference)), explanation)
                : existing.withReference(evidenceReference));
    }

    private boolean unusualUrl(String value) {
        String lower = value.toLowerCase(Locale.ROOT);
        return lower.matches("https?://\\d{1,3}(?:\\.\\d{1,3}){3}.*")
                || lower.contains("xn--")
                || lower.matches(".*https?://[^/]+/(login|verify|payment|secure|refund|kyc|portal|auth|account|update|claim).*");
    }

    private double confidence(List<Evidence> evidence, List<ExtractedIndicator> indicators,
                              boolean hasConclusiveThreatIntel, boolean hasAiAnalysis) {
        if (evidence.isEmpty()) return 0.0;
        double value = 0.30;
        if (!indicators.isEmpty()) value += 0.20;
        if (evidence.stream().anyMatch(item -> item.getTextContent() != null || item.getEmailBody() != null)) value += 0.15;
        if (hasConclusiveThreatIntel) value += 0.15;
        if (hasAiAnalysis) value += 0.20;

        // When external threat intelligence and AI analysis are UNKNOWN or absent,
        // confidence MUST NOT show 100% (capped at 0.65).
        if (!hasConclusiveThreatIntel && !hasAiAnalysis) {
            value = Math.min(0.65, value);
        }
        return Math.min(1.0, value);
    }

    private String missingInformation(List<Evidence> evidence, List<ExtractedIndicator> indicators,
                                      boolean hasConclusiveThreatIntel, boolean hasAiAnalysis) {
        List<String> missing = new ArrayList<>();
        if (evidence.isEmpty()) missing.add("No evidence submitted");
        if (indicators.isEmpty()) missing.add("No deterministic indicators extracted");
        if (!hasConclusiveThreatIntel) {
            missing.add("External threat intelligence (VirusTotal, URLhaus) is unavailable or inconclusive");
        }
        if (!hasAiAnalysis) {
            missing.add("Forensic AI agent analysis has not been executed");
        }
        return String.join("; ", missing);
    }

    private String explanation(int score, RiskCategory category, List<Signal> signals, double confidence,
                               boolean hasConclusiveThreatIntel, boolean hasAiAnalysis) {
        if (signals.isEmpty()) return "No configured deterministic risk signals were found; available evidence is insufficient for a stronger assessment.";
        StringBuilder sb = new StringBuilder();
        sb.append("The score is ").append(score).append(" from ").append(signals.size())
                .append(" distinct deterministic signal(s). Category is ").append(category)
                .append(" and confidence is reported separately at ").append(confidence).append(".");
        if (!hasConclusiveThreatIntel && !hasAiAnalysis) {
            sb.append(" Confidence is capped at ").append(Math.round(confidence * 100))
                    .append("% because external threat intelligence feeds and multi-agent AI analysis are UNKNOWN or have not run.");
        }
        return sb.toString();
    }

    private RiskCategory category(int score) {
        if (score <= 19) return RiskCategory.LOW;
        if (score <= 39) return RiskCategory.MODERATE;
        if (score <= 69) return RiskCategory.HIGH;
        return RiskCategory.CRITICAL;
    }

    private Investigation owned(UUID id) {
        Investigation value = investigationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Investigation not found", HttpStatus.NOT_FOUND));
        if (!value.getUser().getId().equals(securityUtils.getCurrentUserId())) {
            throw new ApiException("Access denied: You do not have permission to access this investigation",
                    HttpStatus.FORBIDDEN);
        }
        return value;
    }

    private record Signal(String key, String label, int weight, Set<String> references, String explanation) {
        Signal withReference(String reference) {
            Set<String> refs = new LinkedHashSet<>(references);
            refs.add(reference);
            return new Signal(key, label, weight, refs, explanation);
        }
        String evidenceReferences() { return String.join(",", references); }
    }
}
