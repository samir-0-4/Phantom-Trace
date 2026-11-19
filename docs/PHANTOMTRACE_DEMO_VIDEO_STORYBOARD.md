# PhantomTrace — Hackathon Demo Video Script & Storyboard
**Target Duration:** 2 minutes 50 seconds (Strictly under the 3-minute hackathon limit)  
**Hackathon:** Kiroween 2026 | **Category:** Frankenstein  
**Application URLs:**
- Frontend: https://phantomtrace04.vercel.app
- Backend: https://phantomtrace-backend-vhxt.onrender.com

---

## Shot-by-Shot Production Storyboard

### Scene 1: The Problem & Introduction (0:00 – 0:20)
- **Visual / Screen:** Open on `https://phantomtrace04.vercel.app`. Full-screen capture of the dark-mode PhantomTrace landing page, showing the glowing terminal aesthetics, tagline, and architectural preview. Smooth cursor navigates to "Login / Register".
- **On-Screen Action:** Quick click to log in with tenant credentials; the analyst dashboard immediately loads displaying active metrics.
- **Narration Voiceover:**
  > "Modern threat actors don't launch isolated attacks—they operate distributed, multi-vector fraud campaigns spanning SMS, email, and spoofed portals. Today's security teams are overwhelmed by disconnected alerts, and generative AI often hallucinates false conclusions. Welcome to PhantomTrace—an open-source forensic intelligence platform that merges deterministic cryptographic parsing with concurrent AI detective agents to automatically reconstruct coordinated cybercrime campaigns."

---

### Scene 2: Three Distinct Suspicious Investigations (0:20 – 0:42)
- **Visual / Screen:** Dashboard view transitioning to the **Investigations** table. Cursor clicks **Seed Demo Campaign** (or filters by `[DEMO] Apex Campaign`).
- **On-Screen Action:** Show the 3 distinct cases generated:
  1. `Apex Campaign — SMS Banking Alert & Account Suspension`
  2. `Apex Campaign — Spear-Phishing Email & KYC Lure`
  3. `Apex Campaign — Vishing Follow-up & Fraud Refund Lure`
- **Narration Voiceover:**
  > "To see PhantomTrace in action, we load a real-world multi-vector scenario: three separate victims submit reports. Case one: an urgent SMS warning of account suspension. Case two: a corporate spear-phishing email demanding KYC verification. Case three: a follow-up vishing text offering a fraudulent fee refund. To an isolated analyst, these appear unrelated."

---

### Scene 3: Deterministic Evidence Extraction (0:42 – 1:07)
- **Visual / Screen:** Click into Case 1 (`SMS Banking Alert`). Navigate to the **Evidence** tab. Highlight the raw message text and click into the extracted IOCs table.
- **On-Screen Action:** Point the mouse at the extracted items:
  - URLs, Domains, IP (`198.51.100.42`), Urgency terms, and OTP flags.
  - Show the green `VERIFIED` epistemic badges and the SHA-256 payload integrity hash.
- **Narration Voiceover:**
  > "When evidence is submitted, PhantomTrace immediately applies local, deterministic regex and lexical extraction. Notice that zero AI calls have been made yet. URLs, domains, IPs, and coercion patterns are extracted with zero hallucination risk, cryptographically sealed with a SHA-256 tamper-evident hash, and stamped with the epistemic status: VERIFIED."

---

### Scene 4: Multi-Agent AI Forensic Reasoning (1:07 – 1:35)
- **Visual / Screen:** Click **Run AI Multi-Agent Analysis**.
- **On-Screen Action:**
  - The **Data Privacy Disclosure Modal** appears: show the clear notice indicating third-party Groq LLM transmission.
  - Click "I understand, continue".
  - Watch the six specialized detective agents execute: `TextDetectiveAgent`, `UrlDetectiveAgent`, `EmailDetectiveAgent`, `FileAnalystAgent`, `IntelligenceCorrelationAgent`, and `InvestigationReportAgent`.
  - Display the structured JSON findings and risk score matrix.
- **Narration Voiceover:**
  > "With ground truth locked, we trigger our multi-agent AI pipeline. First, an explicit privacy confirmation ensures no sensitive PII is leaked. Then, six specialized detective agents powered by Groq LLaMA-3.3 analyze the evidence in parallel—evaluating message psychology, domain homoglyphs, and email headers into strictly typed JSON findings."

---

### Scene 5: Campaign Reconstruction & Evidence Graph (1:35 – 2:10)
- **Visual / Screen:** Navigate to **Campaign Reconstruction** in the main navigation.
- **On-Screen Action:**
  - The interactive React Flow / SVG graph displays the unified Apex Campaign cluster.
  - Show nodes connecting all 3 cases, evidence items, and IOCs.
  - Highlight the shared domain `secure-netbanking-verify.internal-demo.test` and shared IP `198.51.100.42`.
  - Zoom into the edge labels: `SHARES_INDICATOR`, `REFERENCES_DOMAIN`.
- **Narration Voiceover:**
  > "Here is PhantomTrace's breakthrough: Campaign Reconstruction. By correlating indicators across independent tenant investigations, PhantomTrace automatically stitches together the entire attacker infrastructure. The graph proves that all three victims were targeted by the exact same threat actor using a shared C2 domain and hosting IP. Weak signals from single cases combine into an undeniable, high-confidence forensic picture."

---

### Scene 6: Forensic Truth Framework & Court-Ready Report (2:10 – 2:35)
- **Visual / Screen:** Open the **Audit Report** view for the campaign.
- **On-Screen Action:**
  - Scroll past the Risk Score (High 55), the Chain of Custody ledger, and the epistemic tags: `VERIFIED` (green), `AI_INFERENCE` (amber), and `UNKNOWN` (slate).
  - Press `Cmd+P` / Click "Print Report" to preview the clean black-and-white print-ready A4 audit dossier.
- **Narration Voiceover:**
  > "Forensic integrity requires epistemic separation: deterministic facts are marked VERIFIED, generative reasoning is tagged AI_INFERENCE, and unconfigured lookups are marked UNKNOWN—never falsely clean. With one click, generate a court-ready, tamper-evident audit report suitable for legal disclosure and incident response."

---

### Scene 7: Architecture, Kiro Usage & Frankenstein Category (2:35 – 2:52)
- **Visual / Screen:** Fast transition showing code editor: `.kiro/specs/`, `.kiro/hooks/`, `.kiro/agents/`, and terminal showing `mvn test` passing 213 tests.
- **On-Screen Action:** Quick montage of the spec-driven workflow and property-based test suites.
- **Narration Voiceover:**
  > "Built for the Kiroween Frankenstein category, PhantomTrace stitches together modern Java Spring Boot 3.4, React 18, and Groq LLMs. Built with Kiro IDE using spec-driven development, custom agents, pre-commit hooks, and property-based testing verifying thousands of randomized invariants."

---

### Scene 8: Closing & Call to Action (2:52 – 2:58)
- **Visual / Screen:** Return to the live frontend with GitHub repository URL and deployment link on screen.
- **Narration Voiceover:**
  > "Try the live deployment at phantomtrace04.vercel.app or inspect the code on GitHub. Thank you for evaluating PhantomTrace!"

---

## Final Submission Checklist

1. [x] **Video Recording:** Recorded at 1080p 60fps or 30fps.
2. [x] **Duration:** 2 minutes 50 seconds ($\le$ 180 seconds).
3. [x] **Audio:** Clear voiceover with background music ducked.
4. [ ] **Upload to YouTube:**
   - Title: `PhantomTrace — Kiroween 2026 Hackathon Demo`
   - Privacy: Public or Unlisted
   - Category: Science & Technology
5. [ ] **Update README.md:** Replace `(YOUTUBE_VIDEO_URL)` at line 33 with the actual YouTube link.
