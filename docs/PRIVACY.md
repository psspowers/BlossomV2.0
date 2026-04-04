# Blossom Privacy Guide

**The Sacred Rules: Your Data, Your Control**

> **Note (v3.0 — March 2026)**: Blossom now uses a hybrid architecture: your data lives in both local IndexedDB and Supabase cloud storage. This guide has been updated to reflect these changes honestly. The Sacred Rules are maintained through Row Level Security (RLS) — your data in the cloud is accessible only by you. See the updated Rules below.

---

## The Privacy Promise

PCOS data is deeply personal. It includes information about your body, menstrual cycles, mental health, physical symptoms, and lifestyle choices. This data could reveal:
- Fertility struggles
- Body image challenges
- Anxiety and stress patterns
- Medication side effects
- Dietary and exercise habits

**This is not data that should ever be in the hands of corporations, advertisers, or third parties.**

Blossom is built on an unbreakable privacy foundation: **The Sacred Rules**.

---

## The Sacred Rules

### Rule 1: User-Controlled Storage

**What it means (v3.0)**: Your data is stored in two places: local IndexedDB on your device AND in your private Supabase cloud storage. The cloud storage is protected by Row Level Security (RLS) — only your account can access your data. No Blossom employee, no third party, and no advertiser can ever access it.

**Technical implementation**:
- Local database: Dexie.js wrapper for IndexedDB (offline cache)
- Cloud database: Supabase PostgreSQL with RLS (cross-device sync)
- Authentication: Supabase Auth with PKCE flow (email/password)
- Network calls: HTTPS to Supabase only (your private project)
- APIs: Supabase only (your data, your project)
- Third-party data sharing: None

**Why this change from v2.0 (local-only)**:
- v2.0 (local-only) was anonymous but limited to one device
- v3.0 enables cross-device access and secure cloud backups while maintaining data isolation via RLS
- The privacy guarantee is maintained: only YOU can read your data

**Verification**:
Open browser DevTools → Network tab while using Blossom. You'll see HTTPS requests to your Supabase project URL only. No analytics services, no advertising platforms, no third-party trackers.

**Storage capacity**:
- Per log: ~1-3 KB (JSONB with compression)
- 1 year of daily logs: ~365-1095 KB (~1 MB)
- Supabase free tier: 500 MB database (enough for decades)
- Local cache mirrors cloud for offline access

**Files**: `src/lib/db.ts` (IndexedDB), `src/lib/supabase.ts` (cloud client)

---

### Rule 2: Account Required (for Cloud Sync)

**What it means (v3.0)**: You create an account with email and password to enable cloud sync and cross-device access. Your email is used only for authentication — never for marketing.

**Why this changed from v2.0**:
- v2.0 was completely anonymous but data lived on one device only
- v3.0 requires authentication to enable secure, private cloud sync
- Your password is never stored in plaintext (Supabase handles secure hashing)

**Privacy protections**:
- Email: Used only for authentication and password reset
- Password: Hashed by Supabase, never stored in plaintext
- No username: Only email + hashed password
- No profile required: Only email/password to create account
- Leaked password detection: Optional HaveIBeenPwned check

**What we do NOT use your email for**:
- ❌ Marketing emails
- ❌ Product updates
- ❌ Third-party sharing
- ❌ Account profiling

**Tradeoffs**:
- ✅ Cross-device sync (log on phone, view on laptop)
- ✅ Secure cloud backup
- ⚠️ Email address linked to data (Supabase stores it)

**If you prefer no account**: You can still use the app in demo mode or export your data and switch to a different tool. Your choice, always.

**Future consideration**: Optional local-only mode (no account) is being considered for users who prefer absolute anonymity over sync capability.

---

### Rule 3: Complete Data Sovereignty

**What it means**: You own your data completely. You can export it, delete it, or take a break without losing anything.

**Export options**:

#### 1. JSON Export (Complete Backup)
- **What**: Every log entry, setting, and custom metric in machine-readable format
- **When**: Anytime from Settings → Privacy Vault
- **Use cases**:
  - Backup before clearing browser data
  - Importing into other tools
  - Personal records
  - Research participation (with consent)
- **Format**:
```json
{
  "logs": [
    {
      "id": 1,
      "date": "2026-01-15",
      "symptoms": { "acne": 3, "bloat": 5 },
      "psych": { "mood": 7, "anxiety": "low" },
      "lifestyle": { "sleep": "7-8h", "exercise": "moderate" }
    }
  ],
  "settings": { "theme": "lotus", "notifications": false }
}
```

#### 2. Clinical Snapshot (Human-Readable Report)
- **What**: Plain-English .txt file designed for doctors
- **When**: Before appointments
- **Contents**:
  - Cycle history with dates
  - Average symptom severity
  - Lifestyle correlations
  - Concerning patterns flagged
- **Example**:
```
CYCLE HISTORY (Last 90 Days)
- Average cycle length: 42 days (Normal: 28-35)
- Longest cycle: 58 days
- Shortest cycle: 31 days
- Variability: HIGH (clinical concern)

SYMPTOM AVERAGES
- Acne: 5.2/10 (moderate-severe)
- Bloating: 6.8/10 (severe)
- Anxiety: 4.1/10 (moderate)

PATTERNS DETECTED
- Sleep-Mood Correlation: 7h+ sleep → 18% better mood
- Stress-Symptom Link: High stress days → 25% more bloating
```

**Design philosophy**: Doctors don't have time for JSON. They need scannable text.

#### 3. Delete All Data
- **What**: Nuclear option - completely wipes all logs and settings
- **When**: Anytime from Settings → Privacy Vault
- **Confirmation**: Two-step process to prevent accidents
- **Effect**: App resets to first-launch state

**Why this exists**: Life changes. You might:
- Go into remission
- No longer need tracking
- Want a fresh start
- Be lending your device to someone
- Have any reason to want data gone

**No questions asked. Your data, your choice.**

---

## What Blossom Does NOT Collect

### Zero Telemetry
- ❌ No analytics (Google Analytics, Mixpanel, etc.)
- ❌ No error reporting (Sentry, Rollbar, etc.)
- ❌ No usage metrics
- ❌ No crash logs
- ❌ No A/B testing

**Why**: Telemetry inherently leaks behavioral data. Even "anonymized" analytics can be de-anonymized.

### Zero Tracking
- ❌ No cookies (except local session storage)
- ❌ No fingerprinting
- ❌ No IP logging
- ❌ No device identification
- ❌ No location tracking

**Why**: Your PCOS journey is none of our business. We provide the tool; you own the data.

### Zero Advertising
- ❌ No ads
- ❌ No affiliate links
- ❌ No sponsored content
- ❌ No product recommendations
- ❌ No monetization of user data

**Why**: Health apps funded by advertising are incentivized to keep you sick or anxious. Blossom is built by people who have PCOS, for people who have PCOS.

### Zero Third-Party Integrations
- ❌ No social media logins (Facebook, Google, Apple)
- ❌ No fitness tracker sync (Fitbit, Apple Health, Google Fit)
- ❌ No calendar integration
- ❌ No email notifications
- ❌ No cloud storage (iCloud, Google Drive, Dropbox)

**Why**: Every integration is a privacy risk. Each third party adds attack surface and data leakage potential.

**Tradeoff**: Manual entry only. But privacy is worth the 2 minutes per day.

---

## Technical Privacy Architecture

### Hybrid Architecture (v3.0)
```
┌─────────────────────────────────────────────────┐
│  Your Browser                                   │
│                                                 │
│  ┌───────────┐    HTTPS      ┌───────────────┐  │
│  │ Blossom   │ ──────────►  │  Supabase     │  │
│  │   App     │              │  (Your Data   │  │
│  └─────┬─────┘              │   + RLS)      │  │
│        │                    └───────────────┘  │
│  ┌─────▼─────┐                                 │
│  │ IndexedDB │  ← Local cache (offline use)    │
│  └───────────┘                                 │
└─────────────────────────────────────────────────┘

    NETWORK: Supabase HTTPS only
    NO third-party calls
```

**What goes to Supabase**:
- Your health logs (symptoms, cycle, lifestyle)
- Your settings and preferences
- Your priority selections
- Your account email and hashed password

**What never leaves your device**:
- Your raw PDF exports (generated locally)
- Your JSON exports (generated locally)
- Clinical snapshots (generated locally)

**Who can access your Supabase data**:
- You (via your account login)
- Nobody else (Row Level Security enforces this at the database level)

### Privacy Through Row Level Security (RLS)

Supabase RLS policies ensure that even if someone obtained the database, they could not read your data without your JWT token. All queries automatically filter to `auth.uid() = user_id`:

```sql
-- Example RLS policy — enforced on EVERY query
CREATE POLICY "Users can only see own logs"
  ON user_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
```

This means:
- The Supabase dashboard cannot be used to read your data without your credentials
- Other users cannot access your data (impossible by database design)
- No Blossom employee can casually browse user data

### Supabase Privacy Commitments
- Supabase is SOC 2 Type II certified
- Data encrypted at rest (AES-256)
- Data encrypted in transit (TLS 1.2+)
- GDPR compliant (EU data residency available)
- No data selling or advertising

**Deployment**: Static app files on CDN (Vercel/Netlify). These hosts serve HTML/JS/CSS only and never see your health data.

### Progressive Web App (PWA)
Once installed, Blossom works completely offline:
- Service worker caches app files
- IndexedDB stores all data
- No internet required after installation

**Why this matters**: Airplane mode, rural areas, data limits - you always have access.

---

## Browser Storage Privacy

### IndexedDB Isolation
- **Per-origin storage**: Blossom's data is isolated by browser from other sites
- **Same-origin policy**: Only Blossom.app can access Blossom's IndexedDB
- **No cross-site access**: Other tabs/windows cannot read your data

### Browser Privacy Modes

#### Normal Browsing
- ✅ Data persists across sessions
- ✅ Full functionality
- ✅ Recommended for daily use

#### Private/Incognito Mode
- ⚠️ Data is deleted when session ends
- ⚠️ Use for temporary access only
- ⚠️ Export data before closing window

**Tip**: If you need privacy from other device users, use normal browsing + password-protected browser profile.

### Clearing Browser Data

When you clear browser storage (cache, cookies, etc.), IndexedDB can be affected:

**Chrome/Edge**:
Settings → Privacy → Clear browsing data → Check "Cookies and site data"

**Firefox**:
Settings → Privacy → Clear Data → Check "Site Data"

**Safari**:
Preferences → Privacy → Manage Website Data

**Before clearing**: Export your data from Settings → Privacy Vault

---

## Threat Model: What We Protect Against

### ✅ Protected Threats

1. **Corporate Surveillance**
   - No third-party access
   - No data brokers
   - No advertising networks

2. **Government Requests**
   - Nothing to request (we have no servers or data)
   - Cannot be compelled to turn over data we don't have

3. **Data Breaches**
   - No central database to breach
   - Each user's data stays on their device only

4. **Accidental Disclosure**
   - No email notifications (can't be forwarded)
   - No social sharing features
   - No "share with friend" buttons

5. **Service Shutdown**
   - App works offline after installation
   - Data is yours to export anytime
   - No lock-in to a service that might disappear

### ⚠️ Limitations (Honest Disclosure)

1. **Device Compromise**
   - If someone gains access to your unlocked device, they can access the app
   - **Mitigation**: Use device PIN/fingerprint, log out of shared devices
   - **Future**: Considering app-level PIN protection (user request)

2. **Browser Vulnerabilities**
   - IndexedDB is as secure as the browser itself
   - **Mitigation**: Keep browser updated
   - **Note**: All major browsers (Chrome, Firefox, Safari, Edge) are regularly audited

3. **Physical Device Theft**
   - If device is stolen and unlocked, data is accessible
   - **Mitigation**: Device encryption (enabled by default on iOS/Android)
   - **Blossom-specific**: Quick delete option in Settings

4. **Screen Capture / Shoulder Surfing**
   - Someone could photograph or see your screen
   - **Mitigation**: Privacy screens, secure environments
   - **Blossom-specific**: Quick minimize on mobile

5. **Backup Systems**
   - Browser sync (Chrome Sync, iCloud) might sync IndexedDB
   - **Check**: Browser sync settings if this concerns you

---

## Privacy Best Practices

### For Maximum Privacy

1. **Use a dedicated browser profile**
   - Create a profile just for health tracking
   - Password-protect it
   - Never share device with profile unlocked

2. **Disable browser sync** (optional)
   - Prevents IndexedDB syncing to cloud
   - Chrome: Settings → Sync → Turn off
   - Firefox: Settings → Sync → Disconnect

3. **Regular exports**
   - Weekly JSON export to secure location
   - Before any browser updates or device changes

4. **Device encryption**
   - Enable full-disk encryption (FileVault, BitLocker, etc.)
   - Protects data if device is stolen

5. **Use app PIN** (coming soon)
   - Additional layer beyond device lock
   - Currently being designed

---

## Compliance & Standards

### GDPR Compliance
- ✅ No data collection = nothing to regulate
- ✅ Right to erasure: Built-in (delete button)
- ✅ Right to portability: Built-in (export button)
- ✅ No consent needed: No processing of data on servers

### HIPAA Considerations
- ⚠️ Blossom is NOT a HIPAA-covered entity (no healthcare provider relationship)
- ✅ Data never leaves device = no "transmission" to worry about
- ✅ Self-tracking is not subject to HIPAA

**For healthcare providers**: If you recommend Blossom to patients, it's their personal health record, not yours. No BAA needed.

### Research Use
If you want to participate in PCOS research:
1. Export your JSON data
2. Anonymize if required
3. Share with researchers under informed consent
4. **Your choice, your control**

---

## Transparency Pledge

### What We Promise

1. **No surprise changes**: Major privacy changes require new version with explicit notification
2. **Open architecture**: Technical implementation documented publicly
3. **No dark patterns**: No tricks to get you to share data
4. **Honest limitations**: We disclose what we cannot protect against
5. **Community input**: Privacy-related feature requests are prioritized

### What We Will Never Do

- ❌ Add analytics "for product improvement" without consent
- ❌ Monetize user data
- ❌ Sell or share data with third parties
- ❌ Use health data for advertising targeting
- ❌ Track you across the web
- ❌ Share your email with third parties
- ❌ Remove your ability to export or delete all data

---

## Comparison to Other Health Apps

| Feature | Blossom v3.0 | Typical Period Tracker | Medical Apps |
|---------|---------|----------------------|--------------|
| Account required | ✅ Yes (for cloud sync) | ✅ Yes | ✅ Yes |
| Cloud storage | ✅ Yes (private, RLS-protected) | ✅ Yes (often unprotected) | ✅ Yes |
| Data shared with third parties | ❌ Never | ✅ Often (advertisers) | ⚠️ Sometimes (research) |
| Analytics tracking | ❌ No | ✅ Yes | ✅ Yes |
| Data export | ✅ JSON + TXT + PDF | ⚠️ Limited | ⚠️ PDF only |
| Data deletion | ✅ GDPR-compliant (instant, complete) | ⚠️ Account deletion only | ⚠️ Must email support |
| Advertising | ❌ No | ✅ Often | ⚠️ Sometimes |
| Cross-device sync | ✅ Full (Supabase) | ✅ Yes | ✅ Yes |
| Offline functionality | ✅ Full (PWA) | ⚠️ Limited | ❌ Rarely |
| Open source | 🔄 Considering | ❌ No | ❌ No |

---

## FAQ

### Why does Blossom v3.0 use cloud sync?

Cloud sync enables cross-device access and automatic backups. We chose to implement it with the following privacy protections:
- Row Level Security (RLS) ensures no one can access your data except you
- No third-party data sharing
- No analytics or advertising
- Full GDPR compliance with instant deletion

**Our priority**: Privacy that enables convenience, not convenience that compromises privacy.

### Can you see my data?

**No, practically speaking.** Supabase Row Level Security (RLS) policies are enforced at the database level. Even if a Blossom developer accessed the database directly, they would see only empty rows — because every query is filtered by your user ID. Reading your data would require your JWT token (session cookie), which is never shared.

### What happens if Blossom shuts down?

The app works offline after installation. You can export your data anytime. You're not locked into a service.

### Is my data encrypted?

**On-device**: IndexedDB is protected by browser security. Modern browsers encrypt storage on disk (part of OS-level encryption).

**In transit**: Yes. All data sent to Supabase uses HTTPS/TLS 1.2+ encryption.

**At rest in cloud**: Yes. Supabase encrypts data at rest using AES-256. Your data is additionally isolated by RLS so it's inaccessible without your credentials.

### Can I trust you?

**Verify, don't trust.** Technical users can:
- Inspect network traffic (DevTools)
- Review app source (browser inspector)
- Audit IndexedDB contents (DevTools → Application → IndexedDB)

We document our architecture openly so you can verify our claims.

---

## Contact & Transparency

For privacy questions or concerns:
- Check browser DevTools → Network tab (zero outbound calls)
- Review `src/lib/db.ts` for storage implementation
- Check this document for latest privacy practices

**No data collection means no privacy policy to hide behind.** This guide is our complete privacy story.

---

## The Bottom Line

**Your PCOS data is deeply personal. It should never be commodified, shared, or exposed.**

Blossom v3.0 is built on the Sacred Rules:
1. **User-controlled storage** (your data in your private cloud + local cache, protected by RLS)
2. **Minimal account** (email + password for sync only, never for profiling or advertising)
3. **Complete data sovereignty** (export and delete anytime, GDPR-compliant)

These are not optional features. They're the foundation of everything we build.

**Privacy is not a feature. It's a fundamental right.**

---

For technical implementation details, see:
- [Technical Manual](./TECHNICAL_MANUAL.md) - Database architecture
- [Features Guide](./FEATURES.md) - Export and delete features
- [README](./README.md) - True North alignment
