# 🔒 Security Configuration - Action Required

## Status Overview

| Issue | Status | Action Required |
|-------|--------|----------------|
| RLS Performance | ✅ Fixed | None - automatically resolved |
| Function Security | ✅ Fixed | None - automatically resolved |
| Leaked Password Protection | 🔴 **Manual** | **You must enable this** |
| Auth Connection Strategy | 🟡 **Manual** | **You must configure this** |

---

## 🔴 CRITICAL: Enable Leaked Password Protection

**Takes 2 minutes - Do this now!**

1. Open: https://supabase.com/dashboard/project/beasajhtkdfppefagpla/auth/providers
2. Click **"Email"** provider
3. Find **"Password Protection"** section
4. Toggle ON: **"Enable leaked password protection"**
5. Click **"Save"**

**What this does**: Prevents users from choosing passwords that have been exposed in data breaches.

---

## 🟡 IMPORTANT: Update Auth Connection Strategy

**Takes 3 minutes - Needed before production**

1. Open: https://supabase.com/dashboard/project/beasajhtkdfppefagpla/settings/database
2. Scroll to **"Connection Pooling"** section
3. Find **"Auth connection pool configuration"**
4. Change from **"Fixed number"** to **"Percentage"**
5. Set to **5%**
6. Click **"Save"**

**What this does**: Allows Auth service to scale with your database, preventing bottlenecks.

---

## Why Can't This Be Automated?

These are Supabase **project-level** settings controlled through the dashboard API. They require admin authentication and can't be set via SQL migrations or from the application code.

---

## Detailed Instructions

See `docs/SECURITY_CONFIG.md` for:
- Step-by-step screenshots
- Verification procedures
- Troubleshooting help
- Additional security best practices

---

## Questions?

- Supabase Docs: https://supabase.com/docs
- Supabase Support: https://supabase.com/support

**After completing both steps, you can safely delete this file.**
