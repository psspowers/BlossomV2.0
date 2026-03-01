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

## Manual Configuration Required

The following security enhancements require Supabase Dashboard configuration and cannot be automated via SQL migrations:

### 3. Enable Leaked Password Protection

**Status**: ⚠️ Manual Configuration Required

**Steps**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication > Providers > Email**
4. Find the section: **Password Protection**
5. Enable: "Check passwords against HaveIBeenPwned.org database"
6. Save changes

**What it does**: Prevents users from setting passwords that have been exposed in data breaches, significantly improving account security.

**Documentation**: [Supabase Auth Security](https://supabase.com/docs/guides/auth/auth-password-protection)

---

### 4. Update Auth Connection Strategy

**Status**: ⚠️ Manual Configuration Required

**Current Issue**: Auth server uses fixed connection pool (10 connections), which doesn't scale with instance upgrades.

**Steps**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Project Settings > Database > Connection Pooling**
4. Find: **Auth Connection Pool Settings**
5. Change from: `Fixed (10 connections)`
6. Change to: `Percentage-based (5-10% of total)`
7. Save changes

**Recommended Value**: 5-10% of total database connections

**What it does**: Allows Auth server to scale automatically when you upgrade your database instance, preventing connection bottlenecks during high traffic.

**Documentation**: [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool)

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
