# Blossom - Quick Reference Guide

**One-page cheat sheet for common tasks**

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
├── components/      # UI components
├── lib/
│   ├── db.ts       # Database (IndexedDB)
│   ├── hooks/      # Custom React hooks
│   ├── logic/      # Business logic
│   └── themes/     # Theme system
├── App.tsx         # Root component
└── main.tsx        # Entry point
```

## 💾 Database Quick Access

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

### View Database in Browser
1. Open DevTools (F12)
2. Application tab → IndexedDB → BlossomDB

### Check Console for Errors
```javascript
// Add to component for debugging
console.log('State:', state);
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

### Database Not Working
```javascript
// Clear database and reload
await db.delete();
location.reload();
```

## 📊 Key Files to Edit

| Task | File |
|------|------|
| Add new component | `src/components/YourComponent.tsx` |
| Modify database schema | `src/lib/db.ts` (increment version!) |
| Add new theme | `src/lib/themes/types.ts` |
| Change styles | `src/index.css` |
| Add logic/calculations | `src/lib/logic/` |
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

## 📞 Support

| Issue Type | Resource |
|------------|----------|
| Build errors | Check console, run `npm run lint` |
| TypeScript errors | Check `tsconfig.json` |
| Deployment fails | Check hosting dashboard logs |
| Database issues | Check browser DevTools → Application → IndexedDB |
| Theme issues | Check console for errors, verify ThemeProvider |

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Dexie Tutorial](https://dexie.org/docs/Tutorial)
- [Tailwind Docs](https://tailwindcss.com/docs)

## 💡 Pro Tips

1. **Use React DevTools**: Essential for debugging component state
2. **Check IndexedDB**: Most issues are database-related
3. **Build Locally First**: Always test `npm run build` before deploying
4. **Version Control**: Commit often, push regularly
5. **Read Console**: Errors usually have helpful messages
6. **Use TypeScript**: It catches bugs before runtime
7. **Test Themes**: Switch between themes to catch styling issues

---

**Keep this handy!** Bookmark or print for quick access.
