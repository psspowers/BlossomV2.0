# Blossom - Documentation Index

**Complete guide to all documentation and resources**

**Last Updated**: March 2026 (Cloud Sync & Priority System Update)

---

## 📚 Documentation Overview

Blossom is a privacy-first, body-positive PCOS companion app built on the "True North" principles: **Seen, Supported, Sovereign**. This comprehensive documentation suite covers everything from user-facing features to technical architecture to privacy philosophy.

Use this index to navigate based on your role and needs.

---

## 🆕 What's New in Cloud Sync & Priority System Update (February-March 2026)

Major architectural evolution from local-only to hybrid cloud architecture with authentication and multi-device sync capability.

### New Features

1. **User Authentication**: Supabase email/password authentication with PKCE flow
2. **Priority/Happiness System**: User-selected priorities with happiness impact tracking (0-10 scale)
3. **Onboarding Flow**: Multi-step onboarding (Welcome → Auth → Priority Selection → Dashboard)
4. **Cloud Sync**: User logs, settings, and priorities stored in Supabase PostgreSQL
5. **Wisdom Cards System**: Evidence-based educational content repository
6. **Enhanced Data Export**: Clinical snapshots and JSON backups

### New Documentation

1. **SECURITY_CONFIG.md**: Detailed security setup instructions for Supabase
2. **SECURITY_ACTION_REQUIRED.md**: Manual configuration steps for leaked password protection

### Database Schema Changes

1. **user_logs table**: Daily health entries with cloud sync
2. **user_settings table**: User preferences and configuration
3. **user_priorities table**: Priority selections with happiness impact scores
4. **wisdom_cards table**: Educational content library with 6 seeded cards
5. **RLS Policies**: Row-level security for all tables with performance optimization
6. **Auto-update Triggers**: Timestamp management for created_at/updated_at

### Key Architectural Changes

- **From**: Pure local-first with IndexedDB only
- **To**: Hybrid architecture with Supabase backend
- **Authentication**: Email/password with PKCE flow
- **Multi-Device**: Cloud sync enables cross-device data access
- **Privacy**: Maintained through Row Level Security (RLS)

### For Quick Start

- **New users**: Read README.md → FEATURES.md → SECURITY_CONFIG.md
- **Developers**: Read TECHNICAL_MANUAL.md (Sections 4: Database + 6: Soul Injection + new Auth section)
- **Designers**: Read THEME_SYSTEM_GUIDE.md (Body-Positive UX Principles)
- **Privacy advocates**: Read PRIVACY.md (Sacred Rules) + SECURITY_CONFIG.md
- **DevOps**: Read SECURITY_ACTION_REQUIRED.md for deployment checklist

---

## For Healthcare Professionals

### 🏥 CLINICAL_SYSTEM_REPORT.md
**Algorithm Methodology, Scoring Logic, and Interpretation Guide**

**NEW - March 2026**

**Contents**:
- Executive summary of the Blossom Score
- Normalize-First architecture explained
- Four-factor scoring methodology:
  - Symptom Factor (Physical Burden)
  - Self-Care Factor (Metabolic Consistency)
  - Emotional Factor (Psychological Wellness)
  - Stability Factor (Cycle Regularity)
- The Personalization Engine (dynamic weighting)
- The "Sleep Gate" clinical guardrail
- Chart interpretation guide:
  - Wellness Radar (5-axis spider chart)
  - Trend Velocity (longitudinal analysis)
- Golden Rules of the Algorithm
- Detailed factor calculations with formulas
- Data quality & validation standards
- Clinical limitations & disclaimers
- Validation roadmap
- Clinical references

**When to read**:
- Clinical validation or audit
- Understanding algorithm methodology
- Interpreting patient data exports
- Research collaboration proposals
- Medical review for recommendations
- Healthcare provider training

**Key Audience**: Physicians, clinical researchers, healthcare providers, medical auditors, clinical psychologists

---

## For End Users

### 🌸 README.md
**Primary user documentation with True North alignment**

**Contents**:
- Compassionate overview (Guilt to Grace philosophy)
- Soul Injection features:
  - Blossom Score (holistic wellness metric)
  - Seasons (Resting/Growing/Blooming states)
  - Pattern Stories (personalized insights)
  - Daily Wisdom (affirmations + research)
- Privacy & security (Sacred Rules)
- True North alignment: Seen, Supported, Sovereign
- Installation and development guide
- Roadmap overview

**When to read**:
- First-time users
- Understanding the app's philosophy
- Getting started with features
- Sharing with others who have PCOS

**Key Audience**: PCOS patients, potential users, healthcare providers

---

## Core Documentation

### 📖 FEATURES.md
**Complete feature breakdown with True North ties**

**NEW in Soul Injection Update**

**Contents**:
- Page-by-page feature description
- Soul Injection deep dives:
  - Blossom Score detailed breakdown
  - Seasons philosophy and logic
  - Pattern Stories categories
  - Daily Wisdom content types
- Component-by-component UI guide
- True North alignment for each feature
- Technical feature mapping
- Design principles summary

**When to read**:
- Understanding what each page does
- Learning how features serve True North
- Planning feature additions
- User training and support

**Key Audience**: Product managers, designers, support team, developers

---

### 🔒 PRIVACY.md
**The Sacred Rules: Complete privacy philosophy**

**NEW in Soul Injection Update**

**Contents**:
- The three Sacred Rules explained
- Why privacy is non-negotiable for PCOS data
- Technical privacy architecture
- What Blossom does NOT collect
- Threat model and limitations
- Privacy best practices
- Comparison to other health apps
- FAQ and transparency pledge

**When to read**:
- Understanding privacy commitments
- Evaluating Blossom for sensitive use cases
- Explaining privacy to users or stakeholders
- Security audits

**Key Audience**: Privacy-conscious users, security auditors, healthcare compliance officers

---

### 🔐 AUTH_SYSTEM_ANALYSIS.md
**Comprehensive authentication security and UX analysis**

**NEW - March 2026**

**Contents**:
- Current authentication architecture assessment
- Security vulnerability analysis (password recovery, weak passwords, credential stuffing)
- User experience friction points and competitive benchmarking
- Best practice recommendations (password recovery, strength requirements, leaked password protection)
- Implementation strategy with 4-phase roadmap
- Cost-benefit analysis with ROI calculations
- GDPR and HIPAA compliance considerations
- Success metrics and monitoring guidelines
- Risk analysis and mitigation strategies

**When to read**:
- Planning authentication improvements
- Security audit or compliance review
- Evaluating UX gaps in auth flow
- Prioritizing security investments
- Understanding industry standards for auth

**Key Audience**: Security engineers, UX designers, product managers, compliance officers

---

### 📋 PASSWORD_RECOVERY_IMPLEMENTATION_GUIDE.md
**Step-by-step implementation guide for password recovery**

**NEW - March 2026**

**Contents**:
- Phase-by-phase implementation instructions with code samples
- PasswordResetModal component (complete implementation)
- ResetPasswordPage component (complete implementation)
- Email template configuration in Supabase
- Comprehensive testing checklist (end-to-end and edge cases)
- Deployment checklist and rollback plan
- Success metrics to track
- Support documentation templates

**When to read**:
- Implementing password recovery feature
- Adding password reset UI components
- Configuring Supabase email templates
- Testing auth flows end-to-end
- Deploying authentication updates

**Key Audience**: Frontend developers, QA engineers, DevOps engineers

---

### 📊 AUTH_RECOMMENDATIONS_SUMMARY.md
**Executive summary of authentication improvements**

**NEW - March 2026**

**Contents**:
- 2-page executive summary of auth analysis
- Critical problem statement (no password recovery)
- 4-phase implementation roadmap with timelines
- Cost breakdown and ROI analysis ($2,040 investment, 200-2,033% ROI)
- Competitive comparison vs industry leaders
- Immediate action items (can complete today)
- Success metrics and target scores
- Risk analysis (current vs. after implementation)

**When to read**:
- Need executive buy-in for auth improvements
- Quick overview without reading 28-page analysis
- Budget approval presentations
- Understanding business impact of auth gaps
- Prioritizing engineering resources

**Key Audience**: CTOs, product managers, executives, budget approvers

---

### 🗺️ ROADMAP.md
**Phased development plan and vision**

**NEW in Soul Injection Update**

**Contents**:
- Phase 1: Logic Audit (completed)
- Phase 2: User Research (in progress)
- Phase 3: Clinical Enhancements (planned)
- Phase 4: Export & Interoperability (planned)
- Phase 5: Accessibility & i18n (planned)
- Phase 6: Community Features (future)
- Feature backlog and rationale for exclusions
- Success metrics (non-gamified)
- Technical debt tracking
- Long-term vision (3-5 years)

**When to read**:
- Understanding development priorities
- Contributing feature ideas
- Planning sprints
- Stakeholder updates

**Key Audience**: Product managers, contributors, stakeholders

---

## For Developers

### 🔧 TECHNICAL_MANUAL.md
**Complete technical reference with Soul Injection algorithms**

**UPDATED in Soul Injection Update**

**Sections**:
1. Architecture Overview
2. Development Setup
3. Project Structure
4. Database Architecture
5. Component Architecture
6. **Soul Injection: Core Logic** (NEW)
   - 6.1 Blossom Score Algorithm
   - 6.2 Seasons Engine
   - 6.3 Narratives & Daily Wisdom
   - 6.4 Pattern Stories Generator
7. State Management
8. Theme System
9. Build & Deployment
10. Testing & Debugging
11. Extending the App
12. Performance Optimization
13. Troubleshooting
14. API Reference

**When to read**:
- Setting up development environment
- Understanding codebase architecture
- Implementing Soul Injection features
- Adding new features
- Debugging complex issues
- Performance tuning

**Key Topics**:
- Tech stack details
- Database schema (Dexie/IndexedDB)
- Component hierarchy
- **Soul Injection algorithms with code examples** (NEW)
- **Blossom Score formula and weighting rationale** (NEW)
- **Seasons logic and messaging strategy** (NEW)
- **Pattern Stories statistical thresholds** (NEW)
- React Query usage
- Theme system architecture
- Build configuration
- Security considerations

**Key Audience**: Developers, technical architects, data scientists

---

### 🚀 OPERATIONS_MANUAL.md
**DevOps and operations guide (10,000+ words)**

**Sections**:
1. Quick Start for Operators
2. Deployment Procedures
3. Environment Configuration
4. Hosting Configuration
5. Monitoring & Alerting
6. Backup & Recovery
7. Maintenance Procedures
8. Troubleshooting Operations
9. Scaling Considerations
10. Security Operations
11. Compliance & Reporting

**When to read**:
- Deploying to production
- Setting up monitoring
- Incident response
- Regular maintenance
- Scaling the application

**Key Topics**:
- Step-by-step deployment
- Rollback procedures
- Disaster recovery
- Security checklist
- Cost estimates
- Uptime monitoring

---

### ⚡ QUICK_REFERENCE.md
**One-page cheat sheet**

**Quick access to**:
- Common commands
- Code snippets
- Database queries
- Emergency procedures
- File locations
- Pro tips

**When to read**: Daily development, quick lookups

---

## Feature-Specific Guides

### 🎨 THEME_SYSTEM_GUIDE.md
**Body-positive UX and theme system documentation**

**UPDATED in Soul Injection Update**

**Contents**:
- **Body-Positive UX Principles** (NEW):
  - "Guilt to Grace" design philosophy
  - No punishment colors (warm browns vs red alerts)
  - Organic, non-linear visualizations
  - Compassionate animation language
  - Calming color palettes
  - Typography for emotional safety
  - No gamification mechanics
  - Seasonal visual adaptation
- Theme system overview
- Tesla-Apple vs Lotus Garden
- Implementation details
- How to add new themes
- CSS architecture
- Developer guide
- Testing checklist

**When to read**:
- Understanding body-positive design principles
- Adding new themes
- Customizing existing themes
- Designing new UI components
- Understanding theme switching
- Debugging theme issues

**Key Audience**: Designers, UX researchers, frontend developers

---

### 📊 CHART_FIX_GUIDE.md
**Chart and visualization troubleshooting**

**Contents**:
- Common chart issues
- Recharts configuration
- Chart.js setup
- Data formatting
- Performance optimization

**When to read**: Issues with charts or data visualization

---

### 🔍 INTERACTIVE_FILTER_GUIDE.md
**Data filtering implementation**

**Contents**:
- Filter architecture
- Date range selection
- Symptom filtering
- Cycle phase filtering
- Performance considerations

**When to read**: Implementing or modifying filters

---

### 💊 HYPERANDROGENISM_INSIGHTS.md
**Clinical insights feature**

**Contents**:
- Medical background
- Implementation details
- Data analysis algorithms
- Pattern recognition

**When to read**: Understanding PCOS-specific features

---

### 📖 HOW_TO_VIEW_HYPERANDROGENISM.md
**User guide for hyperandrogenism tracking**

**Contents**:
- What is hyperandrogenism
- How to track symptoms
- Interpreting insights
- When to consult doctor

**When to read**: User support, medical context

---

### 📝 IMPLEMENTATION_SUMMARY.md
**Feature implementation overview**

**Contents**:
- Completed features
- Architecture decisions
- Known limitations
- Future enhancements

**When to read**: Project overview, handoff documentation

---

## Quick Navigation by Task

### I want to...

#### **Set up the development environment**
→ Start with: `TECHNICAL_MANUAL.md` → Development Setup
→ Then: Run `npm install` and `npm run dev`

#### **Deploy to production**
→ Read: `OPERATIONS_MANUAL.md` → Deployment Procedures
→ Quick commands: `QUICK_REFERENCE.md` → Quick Deploy

#### **Understand the architecture**
→ Read: `TECHNICAL_MANUAL.md` → Architecture Overview
→ See also: Component Architecture, Database Architecture

#### **Add a new feature**
→ Read: `TECHNICAL_MANUAL.md` → Extending the App
→ Quick guide: `QUICK_REFERENCE.md` → Adding Features

#### **Fix a bug**
→ Start: `TECHNICAL_MANUAL.md` → Troubleshooting
→ Quick fixes: `QUICK_REFERENCE.md` → Common Fixes

#### **Customize the theme**
→ Read: `THEME_SYSTEM_GUIDE.md` (complete guide)
→ Quick: `QUICK_REFERENCE.md` → Theme System

#### **Handle an outage**
→ Read: `OPERATIONS_MANUAL.md` → Disaster Recovery
→ Quick: `QUICK_REFERENCE.md` → Emergency Procedures

#### **Optimize performance**
→ Read: `TECHNICAL_MANUAL.md` → Performance Optimization
→ Check: `OPERATIONS_MANUAL.md` → Performance Issues

#### **Set up monitoring**
→ Read: `OPERATIONS_MANUAL.md` → Monitoring & Alerting
→ Security: Security Operations section

#### **Understand database**
→ Read: `TECHNICAL_MANUAL.md` → Database Architecture
→ Quick queries: `QUICK_REFERENCE.md` → Database Quick Access

#### **Debug charts**
→ Read: `CHART_FIX_GUIDE.md`
→ Also see: `TECHNICAL_MANUAL.md` → Component Architecture

#### **Understand filters**
→ Read: `INTERACTIVE_FILTER_GUIDE.md`

#### **Learn about PCOS features**
→ Read: `HYPERANDROGENISM_INSIGHTS.md`
→ User guide: `HOW_TO_VIEW_HYPERANDROGENISM.md`

#### **Understand Soul Injection features** (NEW)
→ Start: `FEATURES.md` → Soul Injection Deep Dives
→ Technical: `TECHNICAL_MANUAL.md` → Section 6

#### **Understand Blossom Score algorithm** (NEW)
→ Read: `TECHNICAL_MANUAL.md` → 6.1 Blossom Score Algorithm
→ Overview: `FEATURES.md` → Blossom Score

#### **Understand Seasons system** (NEW)
→ Read: `TECHNICAL_MANUAL.md` → 6.2 Seasons Engine
→ Philosophy: `THEME_SYSTEM_GUIDE.md` → Seasonal Visual Adaptation

#### **Understand Pattern Stories** (NEW)
→ Read: `TECHNICAL_MANUAL.md` → 6.4 Pattern Stories Generator
→ Overview: `FEATURES.md` → Pattern Stories

#### **Understand clinical algorithm methodology** (NEW)
→ Read: `CLINICAL_SYSTEM_REPORT.md` → Complete methodology
→ Quick: `FEATURES.md` → Blossom Score overview

#### **Understand privacy architecture** (NEW)
→ Read: `PRIVACY.md` → The Sacred Rules
→ Technical: `TECHNICAL_MANUAL.md` → Security Considerations

#### **Plan new features** (NEW)
→ Read: `ROADMAP.md` → Development Phases
→ Check: `FEATURES.md` → Contributing New Features

#### **Understand body-positive design** (NEW)
→ Read: `THEME_SYSTEM_GUIDE.md` → Body-Positive UX Principles
→ Examples: `FEATURES.md` → Design Principles Summary

---

## Documentation by Audience

### 👨‍💻 Frontend Developer
**Priority Reading**:
1. `TECHNICAL_MANUAL.md` (full read, especially Section 6: Soul Injection)
2. `FEATURES.md` (feature implementation guide)
3. `THEME_SYSTEM_GUIDE.md` (body-positive UX principles)
4. `QUICK_REFERENCE.md` (bookmark)
5. `CHART_FIX_GUIDE.md`
6. `INTERACTIVE_FILTER_GUIDE.md`

### 🚀 DevOps Engineer
**Priority Reading**:
1. `OPERATIONS_MANUAL.md` (full read)
2. `TECHNICAL_MANUAL.md` → Build & Deployment
3. `PRIVACY.md` (understand privacy architecture)
4. `QUICK_REFERENCE.md` → Emergency Procedures

### 🏗️ System Architect
**Priority Reading**:
1. `TECHNICAL_MANUAL.md` → Architecture Overview + Soul Injection
2. `TECHNICAL_MANUAL.md` → Database Architecture
3. `PRIVACY.md` (Sacred Rules architecture)
4. `ROADMAP.md` (long-term vision)
5. `IMPLEMENTATION_SUMMARY.md`
6. `OPERATIONS_MANUAL.md` → Scaling Considerations

### 🎨 UI/UX Designer
**Priority Reading**:
1. `THEME_SYSTEM_GUIDE.md` → Body-Positive UX Principles (MUST READ)
2. `FEATURES.md` → True North alignment per feature
3. `README.md` → Core Features
4. `TECHNICAL_MANUAL.md` → Component Architecture

### 📊 Product Manager
**Priority Reading**:
1. `README.md` → True North alignment
2. `FEATURES.md` → Feature breakdown
3. `ROADMAP.md` → Phased development plan
4. `PRIVACY.md` → Sacred Rules rationale
5. `IMPLEMENTATION_SUMMARY.md`
6. `OPERATIONS_MANUAL.md` → Compliance & Reporting

### 🔒 Privacy / Security Auditor
**Priority Reading**:
1. `PRIVACY.md` → The Sacred Rules (MUST READ)
2. `TECHNICAL_MANUAL.md` → Security Considerations
3. `FEATURES.md` → Clinical Snapshot export
4. `README.md` → Privacy & Security section

### 🏥 Healthcare Provider / Clinical Advisor
**Priority Reading**:
1. `CLINICAL_SYSTEM_REPORT.md` → Algorithm methodology & clinical validation (NEW - MUST READ)
2. `README.md` → Overview + Clinical Snapshot
3. `FEATURES.md` → Clinical Snapshot details
4. `PRIVACY.md` → Why no HIPAA concerns
5. `HYPERANDROGENISM_INSIGHTS.md`
6. `ROADMAP.md` → Clinical Enhancements (Phase 3)

### 🆘 Support Team
**Priority Reading**:
1. `README.md`
2. `FEATURES.md` → How to Use section
3. `HOW_TO_VIEW_HYPERANDROGENISM.md`
4. `QUICK_REFERENCE.md` → Common Fixes

---

## File Sizes & Reading Times

| Document | Size | Reading Time |
|----------|------|--------------|
| README.md | 5 KB | 10 min |
| CLINICAL_SYSTEM_REPORT.md | 25 KB | 30 min |
| FEATURES.md | 20 KB | 25 min |
| PRIVACY.md | 12 KB | 15 min |
| ROADMAP.md | 15 KB | 20 min |
| TECHNICAL_MANUAL.md | 60 KB | 60 min |
| OPERATIONS_MANUAL.md | 45 KB | 45 min |
| QUICK_REFERENCE.md | 8 KB | 5 min |
| THEME_SYSTEM_GUIDE.md | 15 KB | 15 min |
| CHART_FIX_GUIDE.md | 10 KB | 10 min |
| INTERACTIVE_FILTER_GUIDE.md | 8 KB | 10 min |
| HYPERANDROGENISM_INSIGHTS.md | 12 KB | 15 min |
| HOW_TO_VIEW_HYPERANDROGENISM.md | 6 KB | 10 min |
| IMPLEMENTATION_SUMMARY.md | 8 KB | 10 min |

**Total Documentation**: ~249 KB, ~4.5 hours of reading

---

## Documentation Standards

### Format
- All docs in Markdown (.md)
- GitHub-flavored Markdown
- Code blocks with syntax highlighting
- Clear headers and sections

### Structure
- Table of contents for long docs
- Progressive disclosure (simple → complex)
- Code examples included
- Cross-references to related docs

### Maintenance
- Update date at top of each doc
- Version number if applicable
- Review quarterly
- Update on major changes

---

## Contributing to Documentation

### When to Update Docs

**Always update when**:
- Adding new features
- Changing architecture
- Modifying build process
- Adding dependencies
- Changing deployment process

**Which docs to update**:
- Feature added → `TECHNICAL_MANUAL.md` + feature-specific guide
- Deployment changed → `OPERATIONS_MANUAL.md`
- New theme → `THEME_SYSTEM_GUIDE.md`
- New commands → `QUICK_REFERENCE.md`
- Architecture changed → `TECHNICAL_MANUAL.md`

### Documentation Checklist

When adding features:
- [ ] Update TECHNICAL_MANUAL.md if architecture changes
- [ ] Update QUICK_REFERENCE.md with new commands
- [ ] Create feature-specific guide if complex
- [ ] Update README.md if user-facing
- [ ] Update IMPLEMENTATION_SUMMARY.md
- [ ] Add to this DOCUMENTATION_INDEX.md

---

## Getting Help

### Documentation Issues
If you can't find what you need:
1. Check this index for related docs
2. Use Ctrl+F to search within docs
3. Check QUICK_REFERENCE.md for common tasks
4. Review code comments in relevant files

### Where to Find...

- **Commands**: `QUICK_REFERENCE.md`
- **Concepts**: `TECHNICAL_MANUAL.md`
- **Procedures**: `OPERATIONS_MANUAL.md`
- **Features**: `README.md` or feature-specific guide
- **Code examples**: All technical docs include examples

---

## External Resources

### Official Documentation
- [React Docs](https://react.dev) - React 18 guide
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript reference
- [Vite Guide](https://vitejs.dev/guide/) - Build tool documentation
- [Dexie Tutorial](https://dexie.org/docs/Tutorial) - Database library
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

### Libraries Used
- [Radix UI](https://www.radix-ui.com) - Accessible components
- [Recharts](https://recharts.org) - Chart library
- [React Query](https://tanstack.com/query) - State management
- [React Router](https://reactrouter.com) - Routing

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debugging

---

## Version History

### Documentation v1.0 (Current)
- Complete technical manual
- Operations manual
- Quick reference guide
- Theme system guide
- Feature-specific guides
- Documentation index

### Planned Additions
- Video tutorials
- API reference docs
- Component storybook
- Testing guide
- Migration guides

---

## Quick Links

**Most Used Docs**:
- [Quick Reference](./QUICK_REFERENCE.md) - Daily use
- [Technical Manual](./TECHNICAL_MANUAL.md) - Deep dive
- [Operations Manual](./OPERATIONS_MANUAL.md) - Deploy & maintain

**Project Files**:
- [package.json](./package.json) - Dependencies
- [vite.config.ts](./vite.config.ts) - Build config
- [tsconfig.json](./tsconfig.json) - TypeScript config
- [tailwind.config.js](./tailwind.config.js) - Styling config

---

**Need something not covered?** Check if it's in the code comments or create new documentation!

---

*This index is your roadmap to all documentation. Bookmark it!*
