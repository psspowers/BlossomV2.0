# Blossom - Quick Reference Guide

**One-page cheat sheet for common tasks**

**Version**: 3.5 (Hybrid Cloud Architecture)
**Last Updated**: April 4, 2026

---

## 🚀 Quick Deploy

```bash
npm run build && vercel --prod
```

## 🔧 Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Test production build locally
npm run lint         # Check for errors
```

## 📦 Project Structure

```
src/
├── components/
│   ├── onboarding/  # Auth, welcome, priority selection
│   ├── clinical/    # Clinical guides and scoring pipeline
│   └── ui/          # Shared UI primitives
├── lib/
│   ├── db.ts        # IndexedDB schema (Dexie)
│   ├── supabase.ts  # Supabase client singleton
│   ├── hooks/       # Custom React hooks
│   ├── logic/       # Business logic (blossomScore, cycle, seasons...)
│   ├── themes/      # Theme system
│   └── utils/       # exportPDF, etc.
├── App.tsx          # Root component + onboarding flow
└── main.tsx         # Entry point
supabase/
├── functions/
│   └── delete-account/  # GDPR deletion Edge Function
└── migrations/          # 11 SQL migration files
```

## 💾 Database Quick Access

### Local (IndexedDB via Dexie)

```typescript
import { db } from './lib/db';

// Get all logs
const logs = await db.logs.toArray();

// Get logs from date range
const logs = await db.logs
  .where('date')
  .between('2024-01-01', '2024-12-31')
  .toArray();

// Add new log
await db.logs.add({ date: '2024-01-01', /* ... */ });

// Get settings
import { getOrCreateSettings } from './lib/db';
const settings = await getOrCreateSettings();

// Update settings
await db.settings.update(settings.id, { designTheme: 'lotus' });

// Clear all logs
await db.logs.clear();
```

### Cloud (Supabase PostgreSQL)

```typescript
import { supabase } from './lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Fetch user's logs (RLS enforces ownership automatically)
const { data, error } = await supabase
  .from('user_logs')
  .select('*')
  .order('date', { ascending: false });

// Fetch a single record (use maybeSingle, NOT single)
const { data } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle();

// Insert a log
const { error } = await supabase
  .from('user_logs')
  .insert({ user_id: user.id, date: '2026-04-04', /* ... */ });

// Upsert settings
const { error } = await supabase
  .from('user_settings')
  .upsert({ user_id: user.id, theme: 'lotus' }, { onConflict: 'user_id' });

// Fetch priorities
const { data } = await supabase
  .from('user_priorities')
  .select('*')
  .eq('user_id', user.id);
```

### Auth (Supabase)

```typescript
import { supabase } from './lib/supabase';

// Sign up (password: min 8 chars, at least 1 digit, max 128 chars)
const { data, error } = await supabase.auth.signUp({ email, password });

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Send password reset email
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});

// Update password (on ResetPasswordPage after redirect)
await supabase.auth.updateUser({ password: newPassword });

// Listen for auth state changes (avoid async callbacks — deadlock risk)
supabase.auth.onAuthStateChange((event, session) => {
  (() => { /* handle async logic inside IIFE */ })();
});
```

## 🎨 Theme System

```typescript
import { useTheme } from './lib/themes/ThemeContext';

const { designTheme, themeConfig, setDesignTheme } = useTheme();

// Switch theme
await setDesignTheme('lotus');  // or 'default'

// Get theme colors
const primaryColor = themeConfig.colors.primary;
```

## 🔍 Debugging

### View Local Database (IndexedDB)
1. Open DevTools (F12)
2. Application tab → IndexedDB → BlossomDB

### View Cloud Database (Supabase)
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Table Editor
3. View `user_logs`, `user_settings`, `user_priorities`, `user_profiles`, `wisdom_cards`
4. Or use SQL Editor for custom queries (RLS applies — use service role for admin queries)

### Debug Auth State
```javascript
// Check current session in browser console
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
```

### Debug Supabase Queries
```typescript
// Log query errors
const { data, error } = await supabase.from('user_logs').select('*');
if (error) console.error('Supabase error:', error.message, error.code);
```

### Check Environment Variables
```bash
# Verify .env file has these set:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

### Check Console for Errors
```javascript
useEffect(() => {
  console.log('Component mounted');
}, []);
```

### React DevTools
- Install React DevTools browser extension
- Inspect component props and state

## 🐛 Common Fixes

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Theme Not Applying
```javascript
// Check in browser console
console.log(document.documentElement.getAttribute('data-theme'));
```

### Database Not Working (Local)
```javascript
// Clear local database and reload
await db.delete();
location.reload();
```

### Cloud Sync Not Working
1. Check Supabase URL and anon key in `.env`
2. Verify user is signed in: `supabase.auth.getSession()`
3. Check RLS policies in Supabase Dashboard → Authentication → Policies
4. Look for `error` field in Supabase query responses

### Auth Redirect Not Working (Password Reset)
- Ensure Supabase Dashboard → Auth → URL Configuration includes your domain in "Redirect URLs"
- The `/reset-password` route must be accessible without authentication

## 📊 Key Files to Edit

| Task | File |
|------|------|
| Add new component | `src/components/YourComponent.tsx` |
| Modify local DB schema | `src/lib/db.ts` (increment version!) |
| Modify cloud DB schema | Create new file in `supabase/migrations/` |
| Auth configuration | `src/lib/supabase.ts` |
| Add new theme | `src/lib/themes/types.ts` |
| Change styles | `src/index.css` |
| Add logic/calculations | `src/lib/logic/` |
| Modify Blossom Score | `src/lib/logic/blossomScore.ts` |
| Deploy Edge Function | Use Supabase MCP or Supabase Dashboard |
| Update build config | `vite.config.ts` |

## 🎯 Adding Features

### New Symptom
1. Update `LogEntry` interface in `src/lib/db.ts`
2. Add input field in `src/components/DailyLog.tsx`
3. Update calculations in `src/lib/logic/`

### New Theme
1. Add to `DesignTheme` type in `src/lib/themes/types.ts`
2. Add config to `themeConfigs` object
3. Add selector button in `src/components/SettingsModal.tsx`
4. Add CSS overrides in `src/index.css`

### New Insight/Chart
1. Create calculation function in `src/lib/logic/`
2. Add to `useInsights` hook in `src/lib/hooks/useInsights.ts`
3. Create component in `src/components/`
4. Add to `Dashboard.tsx`

## 📝 Git Workflow

```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR, review, merge
git checkout main
git pull
```

## 🚨 Emergency Procedures

### Site Down
```bash
# Rollback immediately
vercel rollback
# or
netlify rollback-deploy
```

### Critical Bug
1. Identify issue in console
2. Rollback deployment
3. Fix bug in separate branch
4. Test thoroughly
5. Deploy fix

### Database Corrupted (User-reported)
User can fix by:
1. Settings → Delete All Data
2. Refresh page
3. Or clear browser data for site

## 🔐 Security Checks

```bash
npm audit                    # Check vulnerabilities
npm audit fix                # Auto-fix if possible
npm outdated                 # Check outdated packages
lighthouse https://your-url  # Full security scan
```

### Supabase Security Checklist
- [ ] RLS enabled on all tables (verify in Dashboard → Table Editor → click table → RLS toggle)
- [ ] All policies use `(select auth.uid())` pattern (not `auth.uid()` directly — performance)
- [ ] No `USING (true)` policies (would allow all access)
- [ ] Edge Functions use service role key server-side only
- [ ] Leaked password protection enabled (HaveIBeenPwned) — see `SECURITY_ACTION_REQUIRED.md`

## 📈 Performance Checks

```bash
# Run Lighthouse
lighthouse https://your-domain.com --view

# Check bundle size
npm run build
# Look at dist/assets/*.js size
```

**Target Metrics**:
- Lighthouse Performance: 90+
- Total Bundle Size: <1 MB
- Load Time (3G): <3s

## 🔗 Important URLs

- **Dev Server**: http://localhost:5173
- **Docs**: /TECHNICAL_MANUAL.md, /OPERATIONS_MANUAL.md
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Netlify Dashboard**: https://app.netlify.com
- **Supabase Dashboard**: https://supabase.com/dashboard (Tables, Auth, Edge Functions, SQL Editor)

## 📞 Support

| Issue Type | Resource |
|------------|----------|
| Build errors | Check console, run `npm run lint` |
| TypeScript errors | Check `tsconfig.json` |
| Deployment fails | Check hosting dashboard logs |
| Local DB issues | Check browser DevTools → Application → IndexedDB → BlossomDB |
| Cloud DB issues | Check Supabase Dashboard → Table Editor, verify RLS policies |
| Auth issues | Check Supabase Dashboard → Authentication → Users |
| Theme issues | Check console for errors, verify ThemeProvider |
| Sync not working | Verify `.env` Supabase keys, check user is signed in |

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Dexie Tutorial](https://dexie.org/docs/Tutorial) - Local IndexedDB library
- [Supabase Docs](https://supabase.com/docs) - Cloud backend
- [Supabase JS Client](https://supabase.com/docs/reference/javascript) - Query reference
- [Tailwind Docs](https://tailwindcss.com/docs)

## 💡 Pro Tips

1. **Use React DevTools**: Essential for debugging component state
2. **Check Both Databases**: Issues may be in IndexedDB (local) or Supabase (cloud) — check both
3. **Build Locally First**: Always test `npm run build` before deploying
4. **Version Control**: Commit often, push regularly
5. **Read Console**: Errors usually have helpful messages
6. **Use TypeScript**: It catches bugs before runtime
7. **Test Themes**: Switch between themes to catch styling issues
8. **RLS Is Always On**: If a Supabase query returns empty unexpectedly, check if the user is authenticated and RLS policies are correct
9. **maybeSingle() not single()**: Always use `maybeSingle()` for queries that might return zero rows
10. **Migrations Are Permanent**: Never modify existing migration files — create new ones instead

---

**Keep this handy!** Bookmark or print for quick access.
