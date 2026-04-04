# Blossom Privacy Guide

**The Sacred Rules: Your Data, Your Control**

**Version**: 3.0 (Hybrid Cloud Architecture)
**Last Updated**: April 4, 2026

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

### Rule 1: Local-Only Storage

**What it means**: All your data lives exclusively on your device in IndexedDB (browser database). Nothing is ever transmitted to servers, clouds, or networks.

**Technical implementation**:
- Database: Dexie.js wrapper for IndexedDB
- Storage location: Browser storage on your device
- Network calls: Zero (except loading the app itself)
- APIs: None
- Cloud sync: None

**Verification**:
Open browser DevTools → Network tab while using Blossom. You'll see zero outbound requests after the initial page load.

**Storage capacity**:
- Per log: 0.5-2 KB
- 1 year of daily logs: 180-730 KB
- Browser limit: 5-10 MB (enough for decades)

**Files**: `src/lib/db.ts` (Dexie database implementation)

---

### Rule 2: No Account Required

**What it means**: You never create an account, provide an email, or authenticate. The app works immediately, completely anonymously.

**Why this matters**:
- No email = no data breach risk
- No password = no credential theft
- No username = no identity linkage
- No profile = no targeted advertising

**Tradeoffs**:
- ❌ Cannot sync across devices
- ✅ Absolute anonymity
- ✅ Zero identity exposure

**Philosophy**: PCOS patients shouldn't have to trade privacy for functionality. Multi-device sync would require cloud storage, which violates Rule 1.

**Future consideration**: Peer-to-peer sync via WebRTC (device-to-device, no server intermediary) is being researched.

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

### Client-Side Only
```
┌─────────────────┐
│  Your Browser   │
│                 │
│  ┌───────────┐  │
│  │ Blossom   │  │  ← All logic runs here
│  │   App     │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ IndexedDB │  │  ← All data stored here
│  └───────────┘  │
└─────────────────┘

     NO NETWORK
       CALLS
```

### No Backend
- No server-side code
- No databases to breach
- No API keys to steal
- No hosting provider to trust

**Deployment**: Static files on CDN (Vercel/Netlify). These hosts serve HTML/JS/CSS but never see your data.

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
- ❌ Create user profiles
- ❌ Track you across the web
- ❌ Require account creation
- ❌ Add cloud sync without explicit opt-in

---

## Comparison to Other Health Apps

| Feature | Blossom | Typical Period Tracker | Medical Apps |
|---------|---------|----------------------|--------------|
| Account required | ❌ No | ✅ Yes | ✅ Yes |
| Cloud storage | ❌ No | ✅ Yes | ✅ Yes |
| Data shared with third parties | ❌ No | ✅ Often (advertisers) | ⚠️ Sometimes (research) |
| Analytics tracking | ❌ No | ✅ Yes | ✅ Yes |
| Data export | ✅ JSON + TXT | ⚠️ Limited | ⚠️ PDF only |
| Data deletion | ✅ One-click | ⚠️ Account deletion only | ⚠️ Must email support |
| Advertising | ❌ No | ✅ Often | ⚠️ Sometimes |
| Offline functionality | ✅ Full | ⚠️ Limited | ❌ Rarely |
| Open source | 🔄 Considering | ❌ No | ❌ No |

---

## FAQ

### Why not use cloud sync for convenience?

Cloud sync requires sending your data to servers. This creates:
- Data breach risk (servers get hacked)
- Jurisdiction issues (where is data stored?)
- Third-party risk (hosting providers can access data)
- Subpoena risk (data can be legally demanded)

**We chose absolute privacy over convenience.** For multi-device access, we're exploring peer-to-peer solutions (WebRTC) that skip servers entirely.

### Can you see my data?

**No.** There are no Blossom servers. Your data never leaves your device. We couldn't access it even if we wanted to.

### What happens if Blossom shuts down?

The app works offline after installation. You can export your data anytime. You're not locked into a service.

### Is my data encrypted?

**On-device**: IndexedDB is protected by browser security. Modern browsers encrypt storage on disk (part of OS-level encryption).

**In transit**: Not applicable (data never leaves device).

**At rest on servers**: Not applicable (no servers).

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

Blossom is built on the Sacred Rules:
1. **Local-only storage** (no cloud, no servers)
2. **No account required** (complete anonymity)
3. **Complete data sovereignty** (export and delete anytime)

These are not optional features. They're the foundation of everything we build.

**Privacy is not a feature. It's a fundamental right.**

---

For technical implementation details, see:
- [Technical Manual](./TECHNICAL_MANUAL.md) - Database architecture
- [Features Guide](./FEATURES.md) - Export and delete features
- [README](./README.md) - True North alignment
