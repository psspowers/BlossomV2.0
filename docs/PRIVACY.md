# Blossom Privacy Policy

**Your health data never leaves your device.**

**Version**: 4.0
**Last Updated**: April 4, 2026

---

## Our Motto

> *"Your body. Your data. Your device. Always."*

Everything we build is guided by one unbreakable principle: **your health data belongs to you, lives on your device, and never travels anywhere else.**

---

## The Clear Distinction

Blossom handles two entirely different categories of information, and we treat them completely differently:

### Health Data — Stays On Your Device, Always

This is the sensitive, personal information that defines your health journey:

- Cycle tracking and menstrual flow
- Symptoms (acne, hirsutism, hair loss, bloating, cramps)
- Mental health and emotional wellbeing (mood, anxiety, stress, body image)
- Lifestyle entries (sleep, water intake, exercise, diet)
- Blossom scores and trend insights
- Custom symptom definitions and personal notes

**Where it lives**: Exclusively in your device's local storage (IndexedDB), managed by Dexie.js. It is never transmitted, never synced, and never accessible to anyone but you.

### Account Data — Standard Authentication Only

To use Blossom, you create an account. This is standard practice for any app and is entirely separate from your health data:

- Email address and hashed password (stored securely via Supabase Auth)
- Account creation and last-seen timestamps
- Authentication tokens (stored in your browser's local storage)

This data is used solely to let you sign in and sign out. It has nothing to do with your health information and is never combined with it.

---

## What This Means in Practice

| Data Type | Where It's Stored | Who Can Access It |
|---|---|---|
| Symptoms, logs, cycle data | Your device only (IndexedDB) | You alone |
| Mood, mental health entries | Your device only (IndexedDB) | You alone |
| Blossom scores and insights | Your device only (computed locally) | You alone |
| Settings and preferences | Your device only (IndexedDB) | You alone |
| Email address | Supabase Auth (encrypted) | You (for sign-in) |
| Password | Supabase Auth (hashed, never readable) | Nobody |
| Last-seen timestamp | Supabase (anonymous timestamp) | Nobody meaningful |

---

## Data Sovereignty: You Own Everything

### Export Your Health Data

Take your health data anywhere, anytime — no permission needed from us:

**JSON Export (Full Backup)**
Every log entry, setting, and custom metric in machine-readable format. Use it for personal records, importing into other tools, or sharing with researchers on your own terms.

**Clinical Snapshot (Doctor-Ready Report)**
A plain-English summary designed for healthcare appointments — cycle history, symptom averages, and patterns flagged in a format clinicians can actually use.

### Delete Everything

A complete wipe removes all health data from your device and permanently deletes your account. Two-step confirmation prevents accidents. No cooldown period, no "we'll keep it for 30 days." Gone means gone.

---

## What We Will Never Do

- Sell, share, or transmit your health data to anyone
- Build advertising profiles based on your health information
- Connect your health data to your account identity
- Use your health data for product analytics or "improvement"
- Require you to give up health privacy for app functionality
- Add cloud sync for health data without your explicit choice

---

## No Telemetry, No Tracking

- No analytics platforms (no Google Analytics, Mixpanel, or equivalents)
- No error reporting services (no Sentry, Rollbar, or equivalents)
- No usage metrics or behavioral tracking
- No advertising networks or affiliate programs
- No fingerprinting or IP logging

---

## Technical Architecture

```
┌──────────────────────────────────┐
│          Your Device             │
│                                  │
│  ┌────────────┐  ┌────────────┐  │
│  │  Blossom   │→ │  IndexedDB │  │ ← ALL health data lives here
│  │    App     │  │  (Local)   │  │
│  └─────┬──────┘  └────────────┘  │
│        │                         │
└────────┼─────────────────────────┘
         │
         │  (Sign-in only)
         ▼
┌────────────────┐
│ Supabase Auth  │ ← Email + password only, no health data
└────────────────┘
```

Health data computation, scoring, and insights all run locally in your browser. The Supabase connection handles authentication only and is never given access to anything you log.

### Progressive Web App (PWA)

After installation, Blossom works completely offline. Your health data is always accessible regardless of internet connection — no signal required.

---

## What We Protect Against

**Corporate surveillance of health data** — Health tracking companies frequently sell cycle and symptom data to insurers, advertisers, and data brokers. Your health data never reaches us, so we can never sell it.

**Data breaches** — A server breach can only expose what a server holds. We hold no health data on our servers, so there is nothing to breach.

**Government requests** — We cannot be compelled to hand over health data we do not have.

**Accidental disclosure** — No email notifications, no social sharing, no "share with your doctor" buttons that route data through our infrastructure.

**Service shutdown** — The app works offline after installation. Your data belongs to you regardless of what happens to Blossom as a service.

---

## Honest Limitations

**Device access** — If someone has physical access to your unlocked device, they can open the app. Use device-level PIN or biometric protection.

**Browser sync** — Chrome Sync or iCloud may sync browser storage. Check your browser's sync settings if this concerns you.

**Physical theft** — Enable full-disk encryption on your device (default on iOS and modern Android).

---

## Compliance

**GDPR** — Right to erasure and right to portability are both built directly into the app. No forms, no waiting period.

**HIPAA** — Blossom is not a HIPAA-covered entity. Your personal health tracking is not subject to HIPAA, and since health data never leaves your device, no transmission rules apply.

---

## The Promise

Your body holds deeply personal information. Your menstrual cycle, your anxiety levels, your hair loss, your relationship with food and exercise — this data can reveal fertility struggles, mental health patterns, and medication effects. It has been exploited by apps that treat health information as a commodity.

Blossom was built by people with PCOS, for people with PCOS. We designed the architecture specifically so that we are technically incapable of accessing your health data, even if we wanted to. Your device is the only place it ever exists.

**Your body. Your data. Your device. Always.**

---

*For technical implementation details, see `src/lib/db.ts` (local database) and the migration files in `supabase/migrations/` (remote schema, authentication only).*
