# Blossom - Operations Manual

**Target Audience**: DevOps, System Administrators, Operations Teams
**Version**: 1.0
**Last Updated**: January 2026

---

## Quick Start for Operators

### Daily Operations Checklist

- [ ] Check build status (if CI/CD enabled)
- [ ] Review error logs (if monitoring enabled)
- [ ] Monitor hosting service dashboard
- [ ] Check SSL certificate expiry

### Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Lead Developer | [Contact Info] | 9am-5pm EST |
| DevOps Engineer | [Contact Info] | On-call |
| Hosting Support | [Provider Support] | 24/7 |

---

## Deployment Procedures

### Prerequisites

- Node.js 18+ installed
- Access to hosting platform account
- Git repository access
- Domain configuration access (if applicable)

### Standard Deployment Process

#### Step 1: Pre-Deployment Checks

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run linter
npm run lint

# Run build locally to test
npm run build

# Test build locally
npm run preview
```

**Validation**:
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Preview works correctly in browser

#### Step 2: Production Build

```bash
# Clean previous build
rm -rf dist

# Create production build
npm run build

# Verify build output
ls -lh dist/
```

**Expected Output**:
```
dist/
├── index.html (2.5 KB)
├── assets/
│   ├── index-[hash].js (~690 KB)
│   └── index-[hash].css (~29 KB)
├── manifest.webmanifest
├── sw.js
└── [static assets]
```

#### Step 3: Deploy to Hosting

##### Option A: Vercel

```bash
# Install Vercel CLI (first time only)
npm i -g vercel

# Deploy to production
vercel --prod

# Or configure GitHub integration for auto-deploy
```

##### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Or use drag-and-drop in Netlify dashboard
```

##### Option C: AWS S3 + CloudFront

```bash
# Sync to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

##### Option D: GitHub Pages

```bash
# Install gh-pages
npm i -D gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

#### Step 4: Post-Deployment Verification

**Smoke Tests**:
1. [ ] Homepage loads (check network tab: 200 OK)
2. [ ] Assets load (CSS, JS, images)
3. [ ] PWA manifest loads
4. [ ] Service worker registers
5. [ ] Can create a log entry
6. [ ] Data persists after refresh
7. [ ] Theme switching works
8. [ ] Settings modal opens
9. [ ] No console errors

**Performance Check**:
```bash
# Run Lighthouse audit
lighthouse https://your-domain.com --view
```

**Target Scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

#### Step 5: Rollback Procedure

If deployment fails:

```bash
# Vercel: Rollback to previous deployment
vercel rollback

# Netlify: Use dashboard to restore previous deploy

# S3: Restore from previous version
aws s3 sync s3://your-bucket-name-backup/ s3://your-bucket-name/

# GitHub Pages: Revert commit and redeploy
git revert HEAD
npm run deploy
```

---

## Environment Configuration

### No Environment Variables Required

This app runs entirely client-side with no backend configuration.

### Optional Configuration

If adding analytics or error tracking:

**Development** (`.env.development`):
```env
VITE_ANALYTICS_ID=dev-analytics-id
VITE_ERROR_TRACKING=false
```

**Production** (`.env.production`):
```env
VITE_ANALYTICS_ID=prod-analytics-id
VITE_ERROR_TRACKING=true
```

Access in code:
```typescript
const analyticsId = import.meta.env.VITE_ANALYTICS_ID;
```

---

## Hosting Configuration

### Vercel Setup

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify Setup

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### CloudFlare Configuration

**Page Rules**:
1. `*your-domain.com/sw.js` → Cache Level: Bypass
2. `*your-domain.com/*` → Cache Everything, Edge Cache TTL: 2 hours

**Security Settings**:
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- Minimum TLS Version: 1.2

---

## Monitoring & Alerting

### Health Checks

Set up uptime monitoring with:
- Uptime Robot (free tier)
- Pingdom
- StatusCake
- CloudFlare Health Checks

**Recommended Checks**:
```
URL: https://your-domain.com
Method: GET
Expected Status: 200
Interval: 5 minutes
Timeout: 30 seconds
```

### Error Tracking (Optional)

**Sentry Setup**:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

**LogRocket Setup**:
```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');
```

### Analytics (Optional)

**Plausible Analytics** (privacy-friendly):
```html
<!-- In index.html -->
<script defer data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"></script>
```

**Google Analytics 4**:
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
ReactGA.send('pageview');
```

### Performance Monitoring

**Web Vitals**:
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Backup & Recovery

### Data Backup Strategy

**User Data**: Stored locally in browser (no server backups needed)

**Code Backups**:
- Primary: GitHub repository
- Secondary: Local developer machines
- Tertiary: Hosting platform (Vercel/Netlify keeps deployment history)

### Code Repository Management

**Branching Strategy**:
```
main (production)
  ├── develop (staging)
  │   ├── feature/new-feature
  │   ├── bugfix/fix-issue
  │   └── hotfix/critical-fix
```

**Backup Schedule**:
- GitHub: Automatic on every push
- Local: Daily developer commits
- Hosting: Automatic on every deployment

### Disaster Recovery Plan

#### Scenario 1: Hosting Platform Down

**Recovery Steps**:
1. Verify outage (check status page)
2. Prepare alternate hosting
3. Deploy to backup hosting:
   ```bash
   # Deploy to backup Netlify account
   netlify deploy --prod --dir=dist --site=backup-site-id
   ```
4. Update DNS to point to backup
5. Notify users of temporary URL

**Recovery Time Objective (RTO)**: 1 hour
**Recovery Point Objective (RPO)**: Last deployment

#### Scenario 2: Critical Bug in Production

**Recovery Steps**:
1. Identify issue (check error logs)
2. Rollback to previous version:
   ```bash
   vercel rollback
   # or
   netlify rollback-deploy
   ```
3. Fix bug in develop branch
4. Test fix thoroughly
5. Deploy fix to production

**RTO**: 15 minutes (rollback)

#### Scenario 3: Domain/DNS Issues

**Recovery Steps**:
1. Verify DNS records:
   ```bash
   dig your-domain.com
   nslookup your-domain.com
   ```
2. Check domain registrar settings
3. Update DNS records if needed
4. Wait for propagation (up to 48 hours)
5. Use temporary Netlify/Vercel URL in meantime

#### Scenario 4: SSL Certificate Expired

**Recovery Steps**:
1. Check certificate expiry:
   ```bash
   openssl s_client -connect your-domain.com:443 -servername your-domain.com
   ```
2. Renew certificate (usually automatic on Vercel/Netlify)
3. If manual: Upload new certificate
4. Verify SSL works

---

## Maintenance Procedures

### Weekly Maintenance

**Monday Morning Checklist**:
```bash
# Check for dependency updates
npm outdated

# Check for security vulnerabilities
npm audit

# Review build logs (if CI/CD)
# Review hosting dashboard
# Check SSL certificate expiry date
```

### Monthly Maintenance

**First Monday of Month**:
```bash
# Update non-breaking dependencies
npm update

# Run full test suite (if tests exist)
npm test

# Run production build test
npm run build

# Deploy to staging (if staging environment)
# Run Lighthouse audit
# Review analytics (if enabled)
```

### Quarterly Maintenance

**Every 3 Months**:
```bash
# Major dependency updates
npm install react@latest react-dom@latest
npm install typescript@latest
npm install vite@latest

# Full regression testing
# Performance audit
# Accessibility audit
# Security audit
# Browser compatibility testing
```

### Security Updates

**Critical Security Patch Process**:
1. Receive security advisory
2. Update affected package:
   ```bash
   npm update [package-name]
   # or
   npm audit fix
   ```
3. Test thoroughly
4. Deploy immediately
5. Monitor for issues

### Database Maintenance

**IndexedDB Cleanup** (client-side, no server maintenance):
- Users manage their own data
- Provide export functionality for backups
- Provide clear data deletion option

---

## Troubleshooting Operations Issues

### Build Failures

**Symptom**: `npm run build` fails

**Diagnosis**:
```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 9+

# Clean install
rm -rf node_modules package-lock.json
npm install

# Check disk space
df -h

# Check memory
free -h
```

**Common Fixes**:
```bash
# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096

# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest
```

### Deployment Failures

**Symptom**: Deployment succeeds but site doesn't load

**Checklist**:
- [ ] Check build output exists in dist/
- [ ] Verify index.html is in dist/
- [ ] Check hosting platform status page
- [ ] Verify DNS settings
- [ ] Check SSL certificate
- [ ] Review deployment logs
- [ ] Check for CORS errors (if applicable)
- [ ] Verify service worker registration

**Debug Commands**:
```bash
# Test build locally
npm run preview

# Check deployment URL
curl -I https://your-domain.com

# Test service worker
curl -I https://your-domain.com/sw.js
```

### Performance Issues

**Symptom**: Slow loading times

**Investigation**:
```bash
# Run Lighthouse
lighthouse https://your-domain.com --view

# Check bundle size
npm run build
# Look for large chunks

# Analyze bundle
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts
```

**Solutions**:
- Enable Brotli/Gzip compression
- Implement code splitting
- Optimize images
- Enable CDN caching
- Minify assets

### SSL Certificate Issues

**Symptom**: HTTPS not working or certificate warnings

**Check Certificate**:
```bash
# Check expiry
echo | openssl s_client -servername your-domain.com \
  -connect your-domain.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Check certificate details
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**Solutions**:
- Vercel/Netlify: SSL auto-renewed, wait or contact support
- CloudFlare: Check SSL/TLS settings
- Custom: Renew certificate manually

---

## Scaling Considerations

### Traffic Patterns

**Expected Load**:
- Static assets only (no API calls)
- ~100 KB per page load (gzipped)
- Caching reduces repeat visits to ~10 KB

**Capacity Planning**:
- 1000 users/day ≈ 100 MB transfer
- 10,000 users/day ≈ 1 GB transfer
- 100,000 users/day ≈ 10 GB transfer

### CDN Configuration

**CloudFlare Settings**:
- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours
- Always Online: On

**Cache Headers** (add to hosting config):
```
Cache-Control: public, max-age=31536000, immutable  # For /assets/*
Cache-Control: public, max-age=0, must-revalidate    # For /index.html
Cache-Control: public, max-age=0, must-revalidate    # For /sw.js
```

### Cost Estimates

**Vercel** (Hobby Plan - Free):
- 100 GB bandwidth/month
- Unlimited deployments
- $0/month for typical usage

**Netlify** (Starter Plan - Free):
- 100 GB bandwidth/month
- 300 build minutes/month
- $0/month for typical usage

**AWS S3 + CloudFront**:
- S3 storage: $0.023/GB/month (~$0.01/month)
- CloudFront: $0.085/GB transfer (~$8.50 for 100 GB)
- Total: ~$10-50/month depending on traffic

---

## Security Operations

### Security Checklist

**Pre-Deployment**:
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Verify no secrets in code
- [ ] Check dependencies for known issues
- [ ] Enable HTTPS only
- [ ] Set security headers
- [ ] Enable HSTS
- [ ] Configure CSP (Content Security Policy)

**Post-Deployment**:
- [ ] Verify SSL certificate valid
- [ ] Check security headers present
- [ ] Test for XSS vulnerabilities
- [ ] Verify no sensitive data exposed
- [ ] Check browser console for errors

### Security Headers

**Required Headers**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Content Security Policy**:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Incident Response

**Security Incident Procedure**:

1. **Detection**: Monitor for unusual activity
2. **Analysis**: Determine scope and impact
3. **Containment**:
   - Take site offline if needed
   - Deploy fix or rollback
4. **Eradication**: Remove vulnerability
5. **Recovery**: Restore service
6. **Post-Incident**: Document and improve

**Emergency Contacts**:
- Hosting provider security team
- Domain registrar support
- CDN provider (if applicable)

---

## Compliance & Reporting

### Privacy Compliance

**GDPR Compliance**:
- ✅ No data collection (exempt from most GDPR)
- ✅ No cookies (except functional)
- ✅ No tracking
- ✅ Data export available
- ✅ Data deletion available

**CCPA Compliance**:
- ✅ No personal data collected
- ✅ No data sold to third parties
- ✅ Privacy policy available

### Accessibility Compliance

**WCAG 2.1 AA**:
- Color contrast ratios meet standards
- Keyboard navigation supported
- Screen reader compatible
- Focus indicators visible
- Semantic HTML

**Testing**:
```bash
# Run accessibility audit
lighthouse https://your-domain.com \
  --only-categories=accessibility --view

# Use axe DevTools browser extension
```

### Reporting

**Monthly Report Template**:
```
## Blossom Operations Report - [Month Year]

### Uptime
- Uptime: 99.9%
- Downtime: 0 minutes
- Incidents: 0

### Performance
- Avg Load Time: 1.2s
- Lighthouse Score: 95/100
- Core Web Vitals: Pass

### Security
- Security Incidents: 0
- Vulnerabilities Patched: 0
- SSL Certificate: Valid

### Deployments
- Production Deploys: 2
- Rollbacks: 0
- Hotfixes: 0

### Maintenance
- Dependencies Updated: 5
- Security Patches: 0

### Traffic (if analytics enabled)
- Unique Visitors: N/A
- Page Views: N/A
- Avg Session Duration: N/A
```

---

## Contact & Support

### Support Tiers

**Tier 1 - User Support**:
- In-app help documentation
- FAQ section

**Tier 2 - Technical Support**:
- GitHub issues
- Email support

**Tier 3 - Infrastructure Support**:
- Hosting provider support
- CDN provider support
- Domain registrar support

### On-Call Procedures

**Severity Levels**:

**P1 - Critical** (Site down):
- Response Time: 15 minutes
- Resolution Time: 1 hour
- Escalation: Immediate

**P2 - High** (Major feature broken):
- Response Time: 1 hour
- Resolution Time: 4 hours
- Escalation: After 2 hours

**P3 - Medium** (Minor feature broken):
- Response Time: 4 hours
- Resolution Time: 24 hours
- Escalation: After 8 hours

**P4 - Low** (Enhancement request):
- Response Time: 24 hours
- Resolution Time: Next sprint

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint

# Deployment
vercel --prod                  # Deploy to Vercel
netlify deploy --prod          # Deploy to Netlify

# Diagnostics
npm outdated                   # Check outdated packages
npm audit                      # Check vulnerabilities
npm list                       # List installed packages
du -sh node_modules            # Check node_modules size

# Cleanup
rm -rf node_modules            # Remove dependencies
rm -rf dist                    # Remove build output
npm cache clean --force        # Clear npm cache
```

### Quick Reference Links

- **Hosting Dashboard**: [Your hosting URL]
- **Domain Registrar**: [Your registrar URL]
- **GitHub Repo**: [Your repo URL]
- **Status Page**: [If applicable]
- **Documentation**: /TECHNICAL_MANUAL.md

---

**End of Operations Manual**

*Keep this document updated with your specific hosting, monitoring, and support details.*
