# Blossom Development Roadmap

**Strategic plan for compassionate PCOS companion development**

---

## Vision

Build the gold standard for privacy-first, body-positive PCOS management. Not through feature bloat, but through **Empathetic Proof** - rigorous science delivered with warmth.

**True North**: Every feature must serve Seen, Supported, or Sovereign principles.

---

## Development Phases

### Phase 1: Logic Audit & Soul Injection ✅ COMPLETED

**Goal**: Replace gamification with compassionate intelligence

**Completed Features**:
- ✅ Blossom Score algorithm (3-factor: symptom/self-care/emotional)
- ✅ Seasons engine (Resting/Growing/Blooming states)
- ✅ Pattern Stories generator (sleep-mood, movement-energy correlations)
- ✅ Daily Wisdom with Monash affirmations
- ✅ Clinical Snapshot export (.txt for doctors)
- ✅ Lotus visualization integration with seasonal colors
- ✅ Removed streak counters and gamification
- ✅ Body-positive messaging throughout UI

**Key Achievements**:
- Transformed guilt-inducing mechanics into validating experiences
- Established algorithmic foundation for personalized insights
- Created bridge between patient data and clinical conversations

**Technical Debt Addressed**:
- Refactored scoring logic from plant growth to holistic wellness
- Separated concerns: visualization (BioOrb) vs logic (blossomScore)
- Improved pattern detection statistical thresholds

---

### Phase 2: User Research & Validation 🔄 IN PROGRESS

**Goal**: Validate assumptions with PCOS community, refine messaging

**Current Status**: Planning & recruitment

#### 2.1 Persona Validation (Q1 2026)

**Research Questions**:
1. Do Seasons messaging resonate emotionally?
2. Is "Resting" reframed effectively (not failure)?
3. Do Pattern Stories feel validating or intrusive?
4. Is Blossom Score breakdown clear and non-judgmental?

**Methods**:
- Semi-structured interviews (n=15-20 PCOS patients)
- Diary studies (7-day trial)
- A/B testing: Seasons language variants
- Feedback surveys in app (opt-in, anonymous)

**Participants**:
- Newly diagnosed (<2 years)
- Long-term PCOS (5+ years)
- Various phenotypes (hyperandrogenic, metabolic, lean, etc.)
- Age range: 18-45

**Deliverables**:
- Persona refinement document
- Messaging guidelines for compassionate language
- Confidence thresholds for Pattern Stories (currently 15% difference)

#### 2.2 Clinical Validation (Q1-Q2 2026)

**Research Questions**:
1. Can doctors use Clinical Snapshot effectively in 10-minute appointments?
2. What data points are most clinically actionable?
3. Does it improve patient-provider communication?

**Methods**:
- Doctor interviews (endocrinologists, gynecologists)
- Clinical Snapshot usability testing
- Compare to traditional symptom diaries

**Participants**:
- 5-10 PCOS-specialized healthcare providers
- 2-3 general practitioners

**Deliverables**:
- Clinical Snapshot v2 (refined format)
- Evidence of clinical utility (case studies)

#### 2.3 Pattern Stories Confidence Tuning (Q2 2026)

**Current Issue**: 15% difference threshold is arbitrary. Need empirical validation.

**Research Questions**:
1. At what statistical threshold do users find stories credible?
2. How much data (n=3 vs n=7 per group) is sufficient?
3. Should confidence be displayed explicitly ("High confidence: 87%")?

**Methods**:
- A/B testing: Show confidence levels vs hide them
- User surveys: "Did this story resonate?"
- Analyze false positive rate (stories that don't reflect reality)

**Deliverables**:
- Refined statistical thresholds
- Confidence display guidelines
- Error rate documentation

---

### Phase 3: Clinical Enhancements 📅 PLANNED (Q2-Q3 2026)

**Goal**: Add medically relevant features requested by PCOS community

#### 3.1 Cycle Variability Index

**Why**: Irregular cycles are core to PCOS diagnosis (Rotterdam criteria). Quantifying variability helps clinical conversations.

**Feature**:
- Calculate standard deviation of cycle lengths (last 6 cycles)
- Flag cycles >35 days or <21 days
- Display in Clinical Snapshot

**Example Output**:
```
CYCLE VARIABILITY: HIGH (Clinical Concern)
- Average: 42 days (Normal: 28-35)
- Standard deviation: 12 days (High: >7 days)
- Range: 31-58 days
- Recommendation: Discuss with endocrinologist
```

**Technical**: `src/lib/logic/cycle.ts` - add `calculateCycleVariability()`

**Effort**: 1 week

#### 3.2 Spotting vs Period Differentiation

**Why**: Hyperandrogenic PCOS often causes spotting that's mistaken for periods. Differentiating helps fertility tracking.

**Feature**:
- Enhance flow tracking: None, Spotting, Light, Medium, Heavy
- Pattern detection: "You've had 3 spotting episodes in 60 days"
- Flag in Clinical Snapshot

**Example Insight**:
```
FLOW PATTERNS (Last 90 Days)
- True periods: 2 (heavy/medium flow, 3+ days)
- Spotting episodes: 4 (1-2 days, light)
- Concern: Irregular ovulation possible
```

**Technical**: Extend `LogEntry.flow` enum, update insights logic

**Effort**: 2 weeks

#### 3.3 Predictive Insights

**Why**: Anticipating symptom patterns reduces anxiety and enables proactive management.

**Feature**:
- Detect temporal patterns: "Your anxiety tends to spike 3 days before your period"
- Cycle phase symptom predictions
- Display in Daily Wisdom when pattern confidence is high

**Example**:
```
Whisper: Based on your cycle, heightened anxiety is likely in 2-3 days.
This is your body preparing for menstruation, not a personal failing.
```

**Technical**: `src/lib/logic/predictive.ts` - time-series analysis

**Effort**: 3-4 weeks (complex algorithm)

#### 3.4 Custom Metrics UI

**Why**: PCOS symptoms vary wildly. Some users need to track libido, hair regrowth, medication side effects, etc.

**Feature**:
- Settings → Add Custom Metric
- Define name, scale (0-10 or categorical)
- Include in Pattern Stories analysis
- Export in Clinical Snapshot

**Example**:
```
Custom Metric: "Metformin GI Side Effects" (0-10)
Pattern: Side effects decrease after 2 weeks of consistent use
```

**Technical**: Already supported in `LogEntry.customValues`, just needs UI

**Effort**: 2 weeks

---

### Phase 4: Export & Interoperability 📅 PLANNED (Q3-Q4 2026)

**Goal**: Maximize data portability and clinical utility

#### 4.1 PDF Clinical Snapshot

**Why**: Some doctors prefer PDF over .txt (easier to upload to EHR)

**Feature**:
- Generate PDF version of Clinical Snapshot
- Include cycle visualizations (charts)
- Professional medical report formatting

**Technical**: Use `jspdf` library for client-side PDF generation

**Effort**: 2 weeks

#### 4.2 CSV Export for Research

**Why**: PCOS research needs data. Users should be able to consent to share anonymized data.

**Feature**:
- Export logs as CSV (Excel-compatible)
- Anonymization options (remove dates, randomize IDs)
- Clear consent language about research use

**Example Use Case**: User participates in university PCOS study, exports anonymized CSV to share with researchers.

**Technical**: CSV generation from logs array

**Effort**: 1 week

#### 4.3 FHIR-Compatible Export (Stretch Goal)

**Why**: Fast Healthcare Interoperability Resources (FHIR) is the emerging standard for health data exchange.

**Feature**:
- Export logs in FHIR-compliant JSON format
- Allows direct upload to some EHR systems
- Future-proofs data portability

**Technical**: Map logs to FHIR Observation resources

**Effort**: 3-4 weeks (requires FHIR expertise)

**Note**: Only if community requests it heavily (complex standard)

---

### Phase 5: Accessibility & Internationalization 📅 PLANNED (Q4 2026)

**Goal**: Make Blossom accessible to more users

#### 5.1 WCAG 2.1 AAA Audit

**Current Status**: Likely AA compliant (Radix UI is accessible), but not audited

**Work**:
- Full accessibility audit
- Keyboard navigation improvements
- Screen reader optimization
- High contrast mode
- Focus indicators

**Effort**: 2-3 weeks

#### 5.2 Multi-Language Support

**Priority Languages** (based on PCOS prevalence):
1. Spanish (large PCOS population in Latin America)
2. Mandarin Chinese (high prevalence in East Asia)
3. Hindi (India has high PCOS rates)
4. Arabic (Middle East prevalence)

**Challenges**:
- Translations must preserve compassionate tone
- Affirmations need cultural sensitivity
- Medical terminology accuracy

**Technical**: i18n library, translation management

**Effort**: 4-6 weeks per language (including native speaker review)

#### 5.3 Right-to-Left (RTL) Support

**Why**: Arabic and Hebrew users

**Technical**: CSS logical properties, Tailwind RTL plugin

**Effort**: 2 weeks

---

### Phase 6: Community Features (Optional) 📅 FUTURE (2027+)

**Goal**: Scale insights through anonymized community data

**Major Caveat**: Must preserve privacy. No feature that compromises Sacred Rules.

#### 6.1 Anonymous Community Pattern Stories

**Concept**: Aggregate anonymized patterns across users (with explicit opt-in consent)

**Example**:
```
Community Insight: 73% of users report better sleep quality
after 4+ weeks of consistent magnesium supplementation.

(Based on 2,847 anonymized users who opted into research sharing)
```

**Privacy Requirements**:
- Explicit opt-in (off by default)
- Client-side anonymization before upload
- No personally identifiable information
- User can revoke consent anytime

**Technical**: Federated learning or differential privacy techniques

**Effort**: 8-12 weeks (requires privacy engineering)

**Risk**: High. Could violate user trust if done poorly. Only proceed if community strongly supports.

#### 6.2 Public PCOS Insights Dashboard

**Concept**: Aggregate statistics for education (no individual data)

**Example**: "Average cycle length by PCOS phenotype" charts

**Use Case**: Educate newly diagnosed patients, inform research

**Privacy**: Only aggregate stats, no individual data, opt-in only

**Effort**: 4-6 weeks

---

## Feature Backlog (Not Roadmapped)

Ideas that don't currently fit True North alignment:

### Medication Tracking
**Why not now**: Adds complexity, risk of medical advice perception. Lifestyle factors first.

**Reconsider if**: Strong community request, clear clinical need.

### Social Sharing
**Why not**: Violates privacy principles. Body autonomy means no comparison.

**Never**: Conflicts with "Guilt to Grace" - comparison creates anxiety.

### Partner Access / Shared Accounts
**Why not**: Privacy nightmare. PCOS data is deeply personal.

**Never**: Cannot guarantee safety in abusive relationships.

### Fertility Tracking / Ovulation Prediction
**Why not**: Different problem domain. Many excellent fertility apps exist.

**Reconsider if**: PCOS users specifically request in research phase.

---

## Success Metrics

### Quantitative (Phase 2+)

- **Engagement**: 50%+ users log 3+ times per week
- **Retention**: 60%+ users active after 30 days
- **Clinical utility**: 70%+ doctors find Clinical Snapshot useful
- **Pattern discovery**: 40%+ users receive high-confidence Pattern Stories

### Qualitative (Ongoing)

- **Emotional safety**: "I feel seen and supported, not judged"
- **Clinical empowerment**: "I can have better conversations with my doctor"
- **Data sovereignty**: "I trust my data is private"
- **True North alignment**: Features serve Seen/Supported/Sovereign

### What We Do NOT Measure

- ❌ Daily active users (guilt-inducing)
- ❌ Streak length (gamification)
- ❌ "Perfect" logging days (binary success/failure)
- ❌ Time spent in app (longer ≠ better for health apps)

---

## Technical Debt

### Current Known Issues

1. **Pattern Stories statistical rigor**: Need peer review of thresholds
2. **Database migrations**: Not yet implemented (v1 schema only)
3. **Error handling**: Limited user-facing error messages
4. **Performance**: No virtualization for large datasets (100+ logs)

### Prioritization

**High Priority** (Q2 2026):
- Database migration system (before v2 schema changes)
- Error handling improvements

**Medium Priority** (Q3 2026):
- Performance optimization (virtualized lists)

**Low Priority** (Q4 2026):
- Code splitting for faster initial load

---

## Community Involvement

### How to Contribute

**User Research**: Participate in studies (Phase 2)
**Feedback**: Use app, report bugs/suggestions
**Documentation**: Improve guides and translations
**Code**: (If open-sourced) Submit PRs for non-core features

### Feature Requests

Submit ideas that align with True North:
- **Seen**: Does it validate the user's experience?
- **Supported**: Does it provide compassionate guidance?
- **Sovereign**: Does it honor user autonomy?

If it doesn't serve one of these, it likely doesn't belong in Blossom.

---

## Long-Term Vision (3-5 Years)

### 2027 Goal: Gold Standard PCOS App
- 10,000+ active users
- Published clinical validation study
- Recommended by PCOS organizations (PCOS Challenge, PCOS Awareness Association)
- Available in 5+ languages
- WCAG AAA accessible

### 2028 Goal: Research Platform
- Anonymized data powers PCOS research (with consent)
- Published papers cite Blossom data
- Partnerships with universities (Monash, NIH)

### 2029+ Goal: Expanded Chronic Condition Support
- Adapt architecture for endometriosis, IBS, other "invisible" conditions
- Same True North principles
- Not just PCOS - compassionate health tracking for all

---

## What Won't Change

**Sacred Rules** (non-negotiable forever):
1. Local-only storage
2. No account required
3. Complete data sovereignty

**True North** (guiding principles):
1. Seen (validation)
2. Supported (compassion)
3. Sovereign (autonomy)

**Design Philosophy**:
- Body-positive, no shame
- Evidence-based, no woo
- Privacy-first, no compromise

---

## Current Sprint (January 2026)

### In Progress
- Documentation updates (this roadmap!)
- Phase 2 research protocol design
- Community feedback collection

### Next Up (February 2026)
- User interview recruitment
- Seasons messaging A/B test setup
- Clinical Snapshot doctor feedback pilot

---

## How to Follow Progress

**Documentation**: Check `ROADMAP.md` (this file) for updates
**Releases**: Version tags indicate major milestones
**Transparency**: Major decisions documented in `IMPLEMENTATION_SUMMARY.md`

---

## Questions & Feedback

For roadmap feedback:
- Check if feature aligns with True North
- Consider privacy implications
- Think about user emotional safety

**Remember**: Feature requests that don't serve Seen/Supported/Sovereign will likely be declined, no matter how technically impressive.

**Quality over quantity. Compassion over features.**

---

For detailed technical plans, see:
- [Technical Manual](./TECHNICAL_MANUAL.md) - Architecture decisions
- [Features Guide](./FEATURES.md) - Current feature set
- [Privacy Guide](./PRIVACY.md) - Sacred Rules rationale
