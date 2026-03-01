# Security Configuration Guide

## Completed Automated Fixes

All SQL-based security issues have been automatically resolved via database migrations:

### 1. RLS Performance Optimization ✓
- **Issue**: Auth functions were re-evaluated for each row, causing performance degradation
- **Fix**: All RLS policies now use `(SELECT auth.uid())` pattern
- **Impact**: Significant performance improvement for multi-row queries
- **Tables Fixed**:
  - `user_logs` (4 policies)
  - `user_settings` (4 policies)
  - `wisdom_cards` (1 policy)

### 2. Function Search Path Security ✓
- **Issue**: `update_updated_at_column()` had mutable search_path
- **Fix**: Function now uses `SET search_path TO 'public', 'pg_temp'`
- **Impact**: Prevents SQL injection and privilege escalation attacks

## Manual Configuration Required - ACTION NEEDED

The following security enhancements require Supabase Dashboard configuration and cannot be automated via SQL migrations. **You must complete these steps manually to resolve all security issues.**

### 3. Enable Leaked Password Protection

**Status**: 🔴 **REQUIRES IMMEDIATE ACTION**

**Why this matters**: Without this enabled, users can set passwords that have been exposed in data breaches, making accounts vulnerable to credential stuffing attacks.

**Steps to Enable**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/beasajhtkdfppefagpla)
2. Navigate to: **Authentication > Providers > Email**
3. Scroll to: **"Password Protection"** section
4. Toggle ON: **"Enable leaked password protection"**
5. Click **"Save"**

**Expected Result**:
- New passwords will be checked against HaveIBeenPwned.org database
- Users attempting to use compromised passwords will be prompted to choose a different one
- No impact on existing passwords (only enforced on new password creation/changes)

**Documentation**: [Supabase Password Protection](https://supabase.com/docs/guides/auth/auth-password-protection)

**Verification**: After enabling, try creating a test user with the password "password123" - it should be rejected.

---

### 4. Update Auth Connection Strategy

**Status**: 🟡 **REQUIRED FOR PRODUCTION SCALE**

**Current Issue**: Auth server uses a fixed pool of 10 connections. If you upgrade your database instance, Auth won't use the additional capacity, creating a bottleneck.

**Why this matters**: In production with multiple concurrent users, the Auth service can exhaust its connection pool, causing authentication failures and degraded performance.

**Steps to Update**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/beasajhtkdfppefagpla)
2. Navigate to: **Settings > Database**
3. Scroll to: **"Connection Pooling"** section
4. Find: **"Auth connection pool configuration"**
5. Change **"Pool Mode"** from: `Fixed number`
6. To: `Percentage of total connections`
7. Set percentage to: **5%** (or 10% for high-traffic apps)
8. Click **"Save"**

**Recommended Values**:
- Small/Medium apps: 5% of total connections
- High-traffic apps: 10% of total connections
- Never go below 5 connections total

**Expected Result**:
- Auth service will scale automatically with database upgrades
- Better connection utilization during traffic spikes
- Prevents Auth bottlenecks in production

**Documentation**: [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool)

**Verification**: After changing, check the connection pool metrics in the Database section to confirm the percentage-based allocation is active.

---

## Verification

### Verify RLS Optimization

Run this query in your Supabase SQL Editor:

```sql
SELECT
  tablename,
  policyname,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_logs', 'user_settings', 'wisdom_cards')
ORDER BY tablename, policyname;
```

✓ All policies should show `(SELECT auth.uid())` or `(SELECT auth.role())` pattern

### Verify Function Security

Run this query in your Supabase SQL Editor:

```sql
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'update_updated_at_column';
```

✓ Function should show `SET search_path TO 'public', 'pg_temp'`

---

## Security Best Practices

### Current Security Posture

1. **Row Level Security**: ✓ Enabled on all user tables
2. **Data Isolation**: ✓ Users can only access their own data
3. **SQL Injection Prevention**: ✓ Function search_path is secure
4. **Performance**: ✓ Auth functions optimized for scale
5. **Password Security**: ⚠️ Requires manual enablement
6. **Connection Scaling**: ⚠️ Requires manual configuration

### Recommendations

1. **Enable Leaked Password Protection** (High Priority)
   - Prevents compromised credentials
   - No performance impact
   - Industry best practice

2. **Update Connection Strategy** (Medium Priority)
   - Required before scaling to larger instance
   - Prevents Auth bottlenecks
   - Future-proofs infrastructure

3. **Monitor Auth Metrics** (Ongoing)
   - Track connection pool usage
   - Monitor failed login attempts
   - Set up alerts for suspicious activity

4. **Regular Security Audits** (Quarterly)
   - Review RLS policies
   - Check for new security recommendations
   - Update dependencies

---

## Migration History

- **2026-03-01**: `fix_rls_and_security_issues` - Optimized RLS policies and function security
- **2026-03-01**: `fix_wisdom_cards_rls_policy` - Optimized wisdom_cards table policies

## Support

For questions or issues with security configuration:
- Supabase Documentation: https://supabase.com/docs
- Supabase Support: https://supabase.com/support
- GitHub Issues: Check project repository
