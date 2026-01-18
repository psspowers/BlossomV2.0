# Blossom - Technical & Operations Manual

**Version**: 1.0
**Last Updated**: January 2026
**Target Audience**: Developers, DevOps, Technical Operators

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Theme System](#theme-system)
8. [Build & Deployment](#build--deployment)
9. [Testing & Debugging](#testing--debugging)
10. [Extending the App](#extending-the-app)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)
13. [API Reference](#api-reference)

---

## Architecture Overview

### Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **UI Components**: Radix UI (18 component libraries)
- **Styling**: Tailwind CSS 3.4.11 + tailwindcss-animate
- **Animations**: Framer Motion 12.25.0
- **Charts**: Recharts 2.12.7 + Chart.js 4.5.1
- **Database**: Dexie 4.2.1 (IndexedDB wrapper)
- **State Management**: React Query (@tanstack/react-query 5.56.2)
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **PWA**: vite-plugin-pwa 1.2.0 + Workbox 7.4.0

### Architecture Pattern

**Client-Side Only Application**
- No backend server required
- All data stored locally in IndexedDB
- Progressive Web App (PWA) enabled
- Offline-first architecture

### Key Design Principles

1. **Privacy First**: Zero data transmission, 100% local storage
2. **Offline Capable**: Full functionality without internet
3. **Performance**: Optimized for low-end devices
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Modularity**: Component-based architecture
6. **Type Safety**: Full TypeScript coverage

---

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or equivalent package manager
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd blossom

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Setup

No environment variables required for basic operation. All configuration is in code.

### Development Server

- **URL**: http://localhost:5173
- **Hot Module Replacement**: Enabled
- **Port**: 5173 (default, configurable in vite.config.ts)

### IDE Setup

**Recommended**: VS Code with extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── BioOrb.tsx       # Main visualization orb
│   │   ├── Dashboard.tsx    # Main dashboard layout
│   │   ├── DailyLog.tsx     # Log entry modal
│   │   ├── SettingsModal.tsx
│   │   ├── CycleContext.tsx # Cycle phase display
│   │   ├── CycleRing.tsx    # Cycle visualization
│   │   ├── DailyWisdom.tsx  # Wisdom card
│   │   ├── Insights.tsx     # Insights section
│   │   ├── TrendVelocity.tsx
│   │   └── WellnessRadar.tsx
│   ├── lib/
│   │   ├── db.ts            # Database schema & helpers
│   │   ├── seed.ts          # Demo data seeder
│   │   ├── resetData.ts     # Data reset utility
│   │   ├── hooks/
│   │   │   └── useInsights.ts
│   │   ├── logic/
│   │   │   ├── achievements.ts
│   │   │   ├── mode.ts      # Interface mode logic
│   │   │   ├── plant.ts     # Plant growth logic
│   │   │   └── velocity.ts  # Trend calculation
│   │   └── themes/
│   │       ├── types.ts     # Theme configs
│   │       └── ThemeContext.tsx
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Build output
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies & scripts
```

### Component Hierarchy

```
App (ThemeProvider, QueryClientProvider)
└── Dashboard
    ├── BioOrb (main visualization)
    ├── CycleContext (cycle info card)
    ├── WellnessRadar (symptom radar chart)
    ├── DailyWisdom (wisdom card)
    ├── Insights (trend analysis)
    │   ├── TrendVelocity
    │   └── CycleRing
    ├── DailyLog (modal)
    └── SettingsModal (modal)
```

---

## Database Architecture

### Storage Technology

**IndexedDB via Dexie.js**
- Key-value object store
- Supports complex queries and indexing
- ~5-10 MB storage limit per origin
- Survives browser restarts

### Schema

```typescript
// Database version 1
class BlossomDB extends Dexie {
  logs!: Table<LogEntry>;
  settings!: Table<Settings>;
}

db.version(1).stores({
  logs: '++id, date',      // Auto-increment ID, indexed date
  settings: '++id'         // Auto-increment ID
});
```

### Data Models

#### LogEntry
```typescript
interface LogEntry {
  id?: number;                    // Auto-increment
  date: string;                   // ISO date (YYYY-MM-DD)
  cyclePhase: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'unknown';
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: {
    acne?: number;                // 0-10 scale
    hirsutism?: number;           // 0-10 scale
    hairLoss?: number;            // 0-10 scale
    bloat?: number;               // 0-10 scale
    cramps?: number;              // 0-10 scale
  };
  psych: {
    stress?: string;              // 'low' | 'medium' | 'high'
    bodyImage?: string;           // 'positive' | 'neutral' | 'negative'
    mood?: number;                // 0-10 scale
    anxiety?: string;             // 'low' | 'medium' | 'high'
  };
  lifestyle: {
    sleep?: string;               // Hours (e.g., '7')
    waterIntake?: number;         // Glasses (0-12)
    exercise?: string;            // 'none' | 'light' | 'moderate' | 'intense'
    diet?: string;                // 'poor' | 'fair' | 'good' | 'excellent'
  };
  customValues?: Record<string, number>;  // User-defined metrics
}
```

#### Settings
```typescript
interface Settings {
  id?: number;                              // Auto-increment
  theme: 'dark' | 'light' | 'auto';        // UI theme
  designTheme: 'default' | 'lotus';        // Design aesthetic
  notifications: boolean;                   // Enable notifications
  customSymptomDefinitions: CustomSymptom[]; // User-defined symptoms
}
```

### Database Helpers

```typescript
// Get or create settings
await getOrCreateSettings(): Promise<Settings>

// Get logs in date range
await getLogsInRange(startDate: string, endDate: string): Promise<LogEntry[]>

// Get last N days of logs
await getLastNDays(days: number): Promise<LogEntry[]>

// Direct Dexie access
db.logs.add(entry)
db.logs.where('date').above('2024-01-01').toArray()
db.logs.update(id, changes)
db.logs.delete(id)
db.logs.clear()
```

### Data Migration Strategy

**Current Version**: 1

**Future Migrations**:
```typescript
// Example: Adding new field
db.version(2).stores({
  logs: '++id, date',
  settings: '++id'
}).upgrade(tx => {
  return tx.table('logs').toCollection().modify(log => {
    log.newField = defaultValue;
  });
});
```

### Storage Estimates

- **Per Log Entry**: ~0.5-2 KB (depending on filled fields)
- **1 Year Daily Logs**: ~180-730 KB
- **5 Years Daily Logs**: ~900 KB - 3.6 MB
- **Browser Limit**: 5-10 MB (years of data)

---

## Component Architecture

### Core Components

#### 1. Dashboard (`Dashboard.tsx`)

**Purpose**: Main application layout and orchestration

**Features**:
- Header with privacy badge and settings button
- BioOrb visualization
- Grid of insight cards
- Floating Action Button (FAB) for adding logs
- Modal management (DailyLog, SettingsModal)

**State**:
```typescript
const { plantState, loading: plantLoading } = usePlantState();
const { themeState, loading: themeLoading } = useInterfaceMode();
const [showDailyLog, setShowDailyLog] = useState(false);
const [showSettings, setShowSettings] = useState(false);
```

#### 2. BioOrb (`BioOrb.tsx`)

**Purpose**: Central health visualization with animated orb

**Props**:
```typescript
interface BioOrbProps {
  health: number;        // 0-100 health score
  streak: number;        // Current streak count
  mode: 'nurture' | 'steady' | 'thrive';  // Interface mode
  name?: string;         // Companion name
}
```

**Features**:
- Animated pulsing orb with color gradients
- Rotating orbital rings
- Streak particle indicators
- Health-based color scheme
- Theme-aware styling

#### 3. DailyLog (`DailyLog.tsx`)

**Purpose**: Full-screen modal for logging daily entries

**Features**:
- Date selector
- Cycle phase picker
- Symptom sliders (0-10)
- Psychological state inputs
- Lifestyle factor inputs
- Form validation
- Success animations
- Auto-save to database

**Form Structure**:
```typescript
interface FormData {
  date: string;
  cyclePhase: string;
  flow: string;
  symptoms: { [key: string]: number };
  psych: { [key: string]: string | number };
  lifestyle: { [key: string]: string | number };
}
```

#### 4. SettingsModal (`SettingsModal.tsx`)

**Purpose**: Settings, achievements, and data management

**Sections**:
1. **Design Theme Selector**: Switch between Tesla-Apple and Lotus Garden
2. **Plant Profile**: Current phase, health score, streak, total logs
3. **Achievements**: Grid of badges with progress bars
4. **Privacy Vault**: Export data, reset demo data, delete all data

#### 5. Insights (`Insights.tsx`)

**Purpose**: Advanced analytics and pattern discovery

**Features**:
- Trend velocity analysis
- Cycle-symptom correlations
- Weekly summaries
- Monthly heatmaps
- Growth comparisons

#### 6. WellnessRadar (`WellnessRadar.tsx`)

**Purpose**: Radar chart showing symptom balance

**Data Source**: Last 7 days average for each symptom category

#### 7. CycleContext (`CycleContext.tsx`)

**Purpose**: Current cycle phase information and insights

**Features**:
- Phase name and description
- Days in current phase
- Phase-specific tips
- Symptom warnings

---

## State Management

### React Query (TanStack Query)

**Configuration**:
```typescript
const queryClient = new QueryClient();
```

**Usage Pattern**:
```typescript
const { data, loading, error } = useQuery({
  queryKey: ['insights'],
  queryFn: async () => {
    const logs = await getLastNDays(30);
    return calculateInsights(logs);
  },
  staleTime: 5 * 60 * 1000,  // 5 minutes
  refetchOnWindowFocus: true
});
```

### Custom Hooks

#### `useInsights()`
```typescript
// Returns plant state, achievements, theme state
const {
  plantState,     // { phase, health, streak }
  achievements,   // { badges, nextBadge, totalStreak, totalLogs }
  themeState,     // { mode: 'nurture' | 'steady' | 'thrive' }
  loading
} = useInsights();
```

#### `usePlantState()`
```typescript
const { plantState, loading } = usePlantState();
// plantState: { phase: string, health: number, streak: number }
```

#### `useInterfaceMode()`
```typescript
const { themeState, loading } = useInterfaceMode();
// themeState: { mode: 'nurture' | 'steady' | 'thrive' }
```

#### `useAchievements()`
```typescript
const { achievements, loading } = useAchievements();
```

### Theme Context

```typescript
const {
  designTheme,      // 'default' | 'lotus'
  themeConfig,      // Full theme configuration
  setDesignTheme,   // (theme: DesignTheme) => Promise<void>
  loading
} = useTheme();
```

---

## Theme System

### Overview

Two design aesthetics with instant switching:
1. **Tesla-Apple (default)**: Modern, tech-forward
2. **Lotus Garden**: Organic, nature-inspired

### Implementation

**CSS Variables**: Theme colors injected as CSS custom properties

```css
:root {
  --theme-primary: rgb(45, 212, 191);
  --theme-secondary: rgb(192, 132, 252);
  --theme-accent: rgb(251, 191, 36);
  /* ... more variables */
}
```

**Data Attribute**: `data-theme="default"` or `data-theme="lotus"` on `<html>`

**Theme-Specific CSS**:
```css
[data-theme="lotus"] .glass-card {
  @apply border-pink-500/20 bg-zinc-900/80;
}
```

### Adding New Themes

1. **Update `types.ts`**: Add theme to `DesignTheme` union type
2. **Add Config**: Create new theme object in `themeConfigs`
3. **Update Selector**: Add button to `SettingsModal`
4. **CSS Overrides**: Add `[data-theme="newtheme"]` rules

See `THEME_SYSTEM_GUIDE.md` for detailed instructions.

---

## Build & Deployment

### Development Build

```bash
npm run dev
# Starts Vite dev server at http://localhost:5173
# Hot Module Replacement (HMR) enabled
# Source maps included
```

### Production Build

```bash
npm run build
# Output: dist/ directory
# Minified and optimized
# Gzip compression estimates shown
```

**Build Output**:
```
dist/
├── index.html                      # Entry HTML
├── assets/
│   ├── index-[hash].js            # Main bundle (~690 KB)
│   └── index-[hash].css           # Styles (~29 KB)
├── manifest.webmanifest            # PWA manifest
├── sw.js                           # Service worker
├── workbox-[hash].js              # Workbox runtime
├── registerSW.js                   # SW registration
└── [static assets]                 # Images, icons, etc.
```

### PWA Configuration

**Manifest** (`vite.config.ts`):
```typescript
{
  name: 'Blossom - PCOS Companion',
  short_name: 'Blossom',
  description: 'Privacy-first PCOS symptom tracking',
  theme_color: '#2dd4bf',
  background_color: '#020617',
  display: 'standalone',
  icons: [/* ... */]
}
```

**Service Worker**: Workbox with `generateSW` strategy
- Precaches all static assets
- Runtime caching for API calls (none currently)
- Offline fallback

### Deployment Targets

**Static Hosting** (recommended):
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

**Configuration**:
```json
// vercel.json / netlify.toml
{
  "builds": [{ "src": "package.json", "use": "@vercel/static-build" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }]
}
```

**SPA Routing**: Ensure all routes fallback to `index.html`

### Build Optimization

**Current Bundle Size**: ~690 KB minified (~223 KB gzip)

**Optimization Opportunities**:
1. **Code Splitting**: Use dynamic imports for routes
2. **Tree Shaking**: Remove unused Radix components
3. **Lazy Loading**: Defer non-critical components
4. **Image Optimization**: Compress PNG/SVG assets

**Example**:
```typescript
// Before
import { SettingsModal } from './components/SettingsModal';

// After (lazy loaded)
const SettingsModal = lazy(() => import('./components/SettingsModal'));
```

---

## Testing & Debugging

### Browser DevTools

**IndexedDB Inspection**:
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB > BlossomDB
4. View logs and settings tables

**React DevTools**:
- Install React DevTools extension
- Inspect component tree
- View props, state, hooks

**Performance Profiling**:
1. Performance tab in DevTools
2. Record interaction
3. Analyze render times, bottlenecks

### Console Debugging

**Enable Verbose Logging**:
```typescript
// In lib/db.ts
db.on('ready', () => console.log('DB ready'));
db.logs.hook('creating', () => console.log('Creating log'));
```

**Query Debugging**:
```typescript
// Add to useInsights hook
useEffect(() => {
  console.log('Plant state:', plantState);
  console.log('Achievements:', achievements);
}, [plantState, achievements]);
```

### Common Issues

**Issue**: Data not persisting
- **Check**: Browser privacy settings (IndexedDB blocked?)
- **Fix**: Use normal browsing mode (not incognito)

**Issue**: Theme not switching
- **Check**: Console for errors in ThemeContext
- **Debug**: `console.log(designTheme)` in ThemeProvider

**Issue**: Slow rendering
- **Check**: Number of log entries (>1000?)
- **Fix**: Implement pagination or virtualization

### Error Boundaries

Add error boundary for graceful degradation:
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Extending the App

### Adding New Symptoms

1. **Update Schema** (`lib/db.ts`):
```typescript
interface LogEntry {
  symptoms: {
    acne?: number;
    newSymptom?: number;  // Add here
  };
}
```

2. **Update Form** (`DailyLog.tsx`):
```tsx
<label>New Symptom</label>
<input type="range" min="0" max="10" />
```

3. **Update Calculations** (`lib/logic/plant.ts`, etc.)

### Adding New Themes

See `THEME_SYSTEM_GUIDE.md` for comprehensive guide.

**Quick Steps**:
1. Add to `DesignTheme` union in `types.ts`
2. Define `ThemeConfig` in `themeConfigs`
3. Add selector button in `SettingsModal`
4. Add CSS overrides in `index.css`

### Adding New Insights

1. **Create Calculation Function** (`lib/logic/`):
```typescript
export function calculateNewInsight(logs: LogEntry[]) {
  // Analysis logic
  return result;
}
```

2. **Add to Hook** (`lib/hooks/useInsights.ts`):
```typescript
const newInsight = useMemo(() => {
  return calculateNewInsight(logs);
}, [logs]);
```

3. **Create Component** (`components/NewInsight.tsx`)
4. **Add to Dashboard**

### Adding New Achievements

Edit `lib/logic/achievements.ts`:
```typescript
const BADGES = [
  // ... existing badges
  {
    id: 'new-achievement',
    name: 'New Achievement',
    description: 'Complete 100 logs',
    icon: '🏆',
    tier: 3,
    condition: (stats) => stats.totalLogs >= 100
  }
];
```

---

## Performance Optimization

### Current Performance

- **Initial Load**: ~1.5s on 3G
- **Time to Interactive**: ~2s
- **Bundle Size**: 690 KB (223 KB gzip)

### Optimization Strategies

#### 1. Code Splitting

```typescript
// Route-based splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/SettingsModal'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

#### 2. Memoization

```typescript
// Expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Component memoization
export const ExpensiveComponent = memo(({ data }) => {
  // Only re-renders if data changes
});
```

#### 3. Virtual Scrolling

For long lists (>100 items):
```typescript
import { VirtualList } from 'react-window';

<VirtualList
  height={600}
  itemCount={logs.length}
  itemSize={80}
>
  {({ index, style }) => (
    <LogItem style={style} log={logs[index]} />
  )}
</VirtualList>
```

#### 4. Image Optimization

- Use WebP format
- Implement lazy loading
- Serve responsive images

```tsx
<img
  src="image.webp"
  loading="lazy"
  srcSet="small.webp 320w, medium.webp 640w, large.webp 1024w"
/>
```

#### 5. Database Query Optimization

```typescript
// Bad: Load all logs then filter in memory
const logs = await db.logs.toArray();
const filtered = logs.filter(l => l.date > '2024-01-01');

// Good: Filter in database
const filtered = await db.logs
  .where('date')
  .above('2024-01-01')
  .toArray();
```

---

## Troubleshooting

### Common Problems

#### Database Not Initializing

**Symptom**: Blank screen, no data

**Causes**:
- IndexedDB disabled in browser
- Privacy/incognito mode
- Storage quota exceeded
- Corrupted database

**Solutions**:
```javascript
// Check IndexedDB support
if (!window.indexedDB) {
  alert('Your browser does not support IndexedDB');
}

// Clear corrupted database
await db.delete();
location.reload();

// Check storage quota
const estimate = await navigator.storage.estimate();
console.log(`Used: ${estimate.usage}, Quota: ${estimate.quota}`);
```

#### Theme Not Applying

**Symptom**: Colors not changing on theme switch

**Debug**:
```javascript
// Check data-theme attribute
console.log(document.documentElement.getAttribute('data-theme'));

// Check CSS variables
const styles = getComputedStyle(document.documentElement);
console.log(styles.getPropertyValue('--theme-primary'));

// Check theme state
const { designTheme } = useTheme();
console.log('Current theme:', designTheme);
```

**Solutions**:
- Clear browser cache
- Check for CSS specificity conflicts
- Ensure ThemeProvider wraps app
- Verify database has designTheme field

#### PWA Not Installing

**Symptom**: Install prompt not showing

**Requirements**:
- HTTPS (or localhost)
- Valid manifest.json
- Service worker registered
- Meets PWA criteria

**Debug**:
```javascript
// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', reg);
});

// Check manifest
fetch('/manifest.webmanifest')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m));
```

#### Slow Performance

**Symptom**: Laggy UI, slow rendering

**Diagnosis**:
```javascript
// Check log count
const count = await db.logs.count();
console.log('Total logs:', count);

// Profile component renders
// Use React DevTools Profiler

// Check bundle size
// Run: npm run build
```

**Solutions**:
- Implement pagination for logs
- Use React.memo for expensive components
- Debounce user inputs
- Optimize images
- Enable code splitting

#### Build Failures

**Symptom**: `npm run build` fails

**Common Causes**:
- TypeScript errors
- Missing dependencies
- Out of memory

**Solutions**:
```bash
# Fix TypeScript errors
npm run lint

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

---

## API Reference

### Database Functions

#### `getOrCreateSettings()`
```typescript
async function getOrCreateSettings(): Promise<Settings>
```
Returns settings object, creating default if none exists.

#### `getLogsInRange(startDate, endDate)`
```typescript
async function getLogsInRange(
  startDate: string,  // ISO date 'YYYY-MM-DD'
  endDate: string     // ISO date 'YYYY-MM-DD'
): Promise<LogEntry[]>
```
Returns logs between dates (inclusive).

#### `getLastNDays(days)`
```typescript
async function getLastNDays(days: number): Promise<LogEntry[]>
```
Returns logs from last N days.

### Logic Functions

#### `calculatePlantState(logs)`
```typescript
function calculatePlantState(logs: LogEntry[]): PlantState
```
Returns `{ phase: string, health: number, streak: number }`.

#### `calculateAchievements(logs)`
```typescript
function calculateAchievements(logs: LogEntry[]): AchievementState
```
Returns achievement progress and unlocked badges.

#### `determineInterfaceMode(logs)`
```typescript
function determineInterfaceMode(logs: LogEntry[]): InterfaceMode
```
Returns `{ mode: 'nurture' | 'steady' | 'thrive' }`.

#### `calculateVelocity(logs, metric)`
```typescript
function calculateVelocity(
  logs: LogEntry[],
  metric: string
): number
```
Returns rate of change for a metric (-1 to 1).

### Theme Functions

#### `useTheme()`
```typescript
function useTheme(): {
  designTheme: DesignTheme;
  themeConfig: ThemeConfig;
  setDesignTheme: (theme: DesignTheme) => Promise<void>;
  loading: boolean;
}
```
Access theme state and controls.

---

## Security Considerations

### Data Privacy

- **No Network Calls**: Zero telemetry or analytics
- **Local Storage Only**: All data in IndexedDB
- **No Third-Party SDKs**: No tracking libraries
- **No Auth Required**: Completely anonymous

### Content Security Policy

Recommended CSP headers:
```
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self';
  img-src 'self' data:;
  connect-src 'self';
```

### XSS Prevention

- All user inputs sanitized
- React auto-escapes by default
- No `dangerouslySetInnerHTML` used

---

## Maintenance

### Regular Tasks

**Weekly**:
- Review console errors in production
- Check bundle size trends
- Monitor user feedback

**Monthly**:
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review analytics (if added)

**Quarterly**:
- Major dependency updates
- Performance audit
- Accessibility audit
- Browser compatibility testing

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update to latest safe versions
npm update

# Update major versions (carefully)
npm install react@latest
```

### Monitoring

Add error tracking (optional):
```typescript
window.addEventListener('error', (event) => {
  // Log to monitoring service
  console.error('Global error:', event.error);
});
```

---

## Resources

### Documentation Links

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [Dexie Docs](https://dexie.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com)

### Project Documentation

- `README.md` - User-facing documentation
- `THEME_SYSTEM_GUIDE.md` - Theme implementation
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `CHART_FIX_GUIDE.md` - Chart troubleshooting
- `HYPERANDROGENISM_INSIGHTS.md` - Clinical insights
- `INTERACTIVE_FILTER_GUIDE.md` - Filter system

---

## Version History

### v1.0.0 (Current)
- Initial release
- Theme system (Tesla-Apple, Lotus Garden)
- Achievement system
- PWA support
- Full TypeScript
- Comprehensive insights

---

## Support

For technical issues, refer to:
1. This manual
2. Console error messages
3. Browser DevTools
4. React DevTools

For feature requests or bugs:
- Document issue clearly
- Include browser/version
- Provide steps to reproduce
- Share console errors

---

**End of Technical Manual**

*This document is living documentation. Update as the application evolves.*
