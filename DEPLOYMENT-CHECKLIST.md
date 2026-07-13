# 🚀 MultiWeb — GitHub Pages Deployment Checklist

> **Project:** MultiWeb — Free Online Tools
> **Target Domain:** `multiweb.app`
> **Hosting:** GitHub Pages (free)
> **Last Updated:** July 13, 2026

---

## ⚡ Quick Start (Essential Steps Only)

> **Estimated time: 30 minutes + 24-48 hours for DNS/SSL propagation**

1. **Push to GitHub** — `git push` your project to a public repo
2. **Enable GitHub Pages** — Settings → Pages → Deploy from branch `main`
3. **Fix sitemap URLs** — Update `.xml` to use `.html` extensions (see Step 6)
4. **Fix canonical URLs** — Update meta tags in all HTML files (see Step 7)
5. **Set up custom domain** (optional) — Add DNS records, configure in GitHub
6. **Enable HTTPS** — Check "Enforce HTTPS" after SSL provisions
7. **Submit to Google Search Console** — Verify ownership, submit sitemap
8. **Test all tools** — Click through every page and tool
9. **Run Lighthouse audit** — Aim for 90+ scores
10. **Done!** 🎉

---

## 🛠️ Troubleshooting Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Site shows 404 after enabling Pages | Branch/folder misconfigured | Settings → Pages → Branch: `main`, Folder: `/ (root)` |
| Custom domain not working | DNS not propagated | Wait 24-48 hours, check at dnschecker.org |
| SSL certificate not provisioning | DNS not pointing to GitHub | Verify A records point to 185.199.108-111.153 |
| Mixed content warnings | HTTP resources on HTTPS page | Update all `http://` to `https://` in code |
| Service worker not registering | Path issue or scope problem | Check sw.js is at root, verify scope in DevTools |
| Sitemap shows 404 | File not deployed | Ensure sitemap.xml is in repo root |
| Clean URLs not working | GitHub Pages limitation | Use `.html` extensions or implement JS redirects |
| Theme toggle not persisting | localStorage blocked | Some browsers block localStorage in incognito |
| QR code generation fails | CDN script not loading | Check network, verify QRious CDN URL is accessible |
| Fonts not loading | Google Fonts CDN blocked | Check network, consider self-hosting fonts |

---

## 1. GitHub Repository Setup

- [ ] **Create a new GitHub repository**
  - Name it `multiweb` (or match your preference)
  - Set visibility to **Public** (required for free GitHub Pages)
  - Do **NOT** initialize with README, .gitignore, or license (you already have files)

- [ ] **Push your project to GitHub**
  ```bash
  cd "C:\Users\HP 840 G4\Desktop\App Project\multiweb"
  git init
  git add .
  git commit -m "Initial deployment — MultiWeb v1.0"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/multiweb.git
  git push -u origin main
  ```

- [ ] **Verify all files are pushed**
  - [ ] All `.html` files present
  - [ ] `common-styles.css` present
  - [ ] `common.js` present
  - [ ] `sw.js` present
  - [ ] `logo.svg` present
  - [ ] `og-default.png` present
  - [ ] `sitemap.xml` present
  - [ ] `robots.txt` present
  - [ ] `wordlist.txt` present

---

## 2. Enable GitHub Pages

- [ ] Go to **Settings → Pages** in your GitHub repository
- [ ] Under **Source**, select **Deploy from a branch**
- [ ] Under **Branch**, select `main` and folder `/ (root)`
- [ ] Click **Save**
- [ ] Wait 1-2 minutes for the first deployment
- [ ] Verify deployment at: `https://YOUR_USERNAME.github.io/multiweb/`

---

## 3. Custom Domain Setup (`multiweb.app`)

### 3a. Configure DNS Records

Add these DNS records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

| Type  | Host        | Value                        | TTL   |
|-------|-------------|------------------------------|-------|
| `A`   | `@`         | `185.199.108.153`            | 600   |
| `A`   | `@`         | `185.199.109.153`            | 600   |
| `A`   | `@`         | `185.199.110.153`            | 600   |
| `A`   | `@`         | `185.199.111.153`            | 600   |
| `CNAME` | `www`     | `YOUR_USERNAME.github.io`    | 600   |

> **Note:** These 4 A records point to GitHub Pages' load balancers. The CNAME ensures `www` also works.

### 3b. Configure in GitHub

- [ ] Go to **Settings → Pages**
- [ ] Under **Custom domain**, enter: `multiweb.app`
- [ ] Click **Save**
- [ ] Check **"Enforce HTTPS"** (enable after SSL is provisioned — see step 4)
- [ ] A `CNAME` file will be automatically created in your repo root

### 3c. Verify DNS Propagation

- [ ] Run: `nslookup multiweb.app` (should show GitHub IPs after ~15 min to 48 hours)
- [ ] Check at: https://dnschecker.org/
- [ ] Once DNS propagates, GitHub will automatically provision an SSL certificate

---

## 4. SSL/HTTPS Configuration

- [ ] After DNS propagation, GitHub auto-provisions a **free Let's Encrypt SSL certificate**
- [ ] Go to **Settings → Pages**
- [ ] Enable **"Enforce HTTPS"** checkbox
- [ ] Verify HTTPS works: visit `https://multiweb.app`
- [ ] Verify no mixed-content warnings (all resources should load over HTTPS)
  - Google Fonts: ✅ Already HTTPS
  - QRious CDN: ✅ Already HTTPS (`https://cdnjs.cloudflare.com/...`)
- [ ] Check for console errors related to mixed content

---

## 5. Sitemap & URL Structure Fix ⚠️ CRITICAL

**Issue Found:** Your `sitemap.xml` uses clean URLs (e.g., `/tools/bmi-calculator`) but your actual files are `bmi-calculator.html`. GitHub Pages does **NOT** support clean URLs by default — it serves `.html` files directly.

### Option A: Fix Sitemap to Match File Structure (Recommended)

Update `sitemap.xml` URLs to use `.html` extensions:

```xml
<url>
  <loc>https://multiweb.app/bmi-calculator.html</loc>
  ...
</url>
```

### Option B: Use GitHub Pages SPA Approach (More Complex)

Add a `404.html` that redirects clean URLs to `.html` files using JavaScript. This is a more advanced approach.

### Option C: Use a Static Site Generator

Use Jekyll (built into GitHub Pages) to handle clean URLs automatically.

**→ I recommend Option A for simplicity. See `sitemap.xml` fix below.**

---

## 6. Update Sitemap URLs

Update your `sitemap.xml` to match actual GitHub Pages URL structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://multiweb.app/</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://multiweb.app/bmi-calculator.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/unit-converter.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/qr-generator.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/word-counter.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/percentage-calculator.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/password-generator.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/image-converter.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/word-unscrambler.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://multiweb.app/about.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://multiweb.app/contact.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://multiweb.app/privacy.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

## 7. Update Canonical URLs

Update all `canonical` URLs and Open Graph URLs in HTML files to use `.html` extensions:

- [ ] `index.html` → `https://multiweb.app/`
- [ ] `bmi-calculator.html` → `https://multiweb.app/bmi-calculator.html`
- [ ] `unit-converter.html` → `https://multiweb.app/unit-converter.html`
- [ ] `qr-generator.html` → `https://multiweb.app/qr-generator.html`
- [ ] `word-counter.html` → `https://multiweb.app/word-counter.html`
- [ ] `percentage-calculator.html` → `https://multiweb.app/percentage-calculator.html`
- [ ] `password-generator.html` → `https://multiweb.app/password-generator.html`
- [ ] `image-converter.html` → `https://multiweb.app/image-converter.html`
- [ ] `word-unscrambler.html` → `https://multiweb.app/word-unscrambler.html`
- [ ] `about.html` → `https://multiweb.app/about.html`
- [ ] `contact.html` → `https://multiweb.app/contact.html`
- [ ] `privacy.html` → `https://multiweb.app/privacy.html`

---

## 8. Performance Optimization

### 8a. Image Compression
- [ ] Compress `og-default.png` using [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
- [ ] Target: Keep under 300KB for Open Graph image

### 8b. CSS/JS Minification (Optional but Recommended)
- [ ] Minify `common-styles.css` → `common-styles.min.css`
- [ ] Minify `common.js` → `common.min.js`
- [ ] Minify `sw.js` → `sw.min.js`
- [ ] Use online tools: [CSS Minifier](https://cssminifier.com/), [JS Minifier](https://javascript-minifier.com/)

### 8c. Caching Strategy
- [x] Service Worker (`sw.js`) is already implemented ✅
- [ ] Verify service worker registers correctly in production
- [ ] Add cache headers via GitHub Pages (limited control) — relies on browser defaults

### 8d. Font Loading Optimization
- [x] Google Fonts with `display=swap` already implemented ✅
- [ ] Consider self-hosting fonts for better performance and privacy

### 8e. Compression
- [ ] GitHub Pages serves files with Gzip/Brotli compression automatically ✅

---

## 9. Testing Checklist

### 9a. Desktop Testing (Chrome, Firefox, Safari, Edge)
- [ ] **Home page** (`index.html`)
  - [ ] Hero section renders correctly
  - [ ] Search functionality works
  - [ ] All 6 tool cards visible and clickable
  - [ ] Theme toggle (light/dark) works
  - [ ] Footer links correct
- [ ] **BMI Calculator** (`bmi-calculator.html`)
  - [ ] Metric/Imperial toggle works
  - [ ] BMI calculation correct for metric
  - [ ] BMI calculation correct for imperial
  - [ ] Results display with color-coded scale
  - [ ] Share/copy button works
  - [ ] FAQ accordion opens/closes
- [ ] **Unit Converter** (`unit-converter.html`)
  - [ ] All 5 categories work (Length, Weight, Temperature, Volume, Speed)
  - [ ] Conversion updates instantly on input
  - [ ] Swap button reverses units
  - [ ] History saves conversions
- [ ] **QR Generator** (`qr-generator.html`)
  - [ ] QR code generates from URL input
  - [ ] QR code generates from text input
  - [ ] Size selector works
  - [ ] Color picker works (foreground/background)
  - [ ] Auto-generate toggle works
  - [ ] Download PNG works
- [ ] **Word Counter** (`word-counter.html`)
  - [ ] Word count updates in real-time
  - [ ] Character count includes/excludes spaces
  - [ ] Sentence count correct
  - [ ] Paragraph count correct
  - [ ] Reading time estimate works
- [ ] **Percentage Calculator** (`percentage-calculator.html`)
  - [ ] "% of Number" mode works correctly
  - [ ] "% is What" mode works correctly (FIXED BUG)
  - [ ] "% Change" mode works correctly
  - [ ] "Tip Calculator" mode works correctly
- [ ] **Password Generator** (`password-generator.html`)
  - [ ] Length slider works (8-64)
  - [ ] Character type checkboxes work
  - [ ] Exclude ambiguous characters works
  - [ ] Strength meter updates
  - [ ] Copy to clipboard works
  - [ ] Regenerate button works
- [ ] **Image Converter** (`image-converter.html`)
  - [ ] Drag-and-drop upload works
  - [ ] Click-to-browse upload works
  - [ ] Format conversion (PNG, JPG, WebP) works
  - [ ] Width/height resize works
  - [ ] Quality slider works
  - [ ] Aspect ratio lock works
  - [ ] Download converted image works
  - [ ] Before/after preview shows correctly
- [ ] **Word Unscrambler** (`word-unscrambler.html`)
  - [ ] Word search works
  - [ ] Min length filter works
  - [ ] Starts with filter works
  - [ ] Ends with filter works
  - [ ] Contains filter works
  - [ ] Copy all results works
  - [ ] Related tool links point to correct pages (FIXED BUG)
- [ ] **About Page** (`about.html`)
  - [ ] Content renders correctly
  - [ ] Footer links correct
- [ ] **Contact Page** (`contact.html`)
  - [ ] Email link works
  - [ ] Content renders correctly
- [ ] **Privacy Page** (`privacy.html`)
  - [ ] Content renders correctly
  - [ ] Last updated date correct
- [ ] **404 Page** (`404.html`)
  - [ ] Shows when visiting non-existent URL
  - [ ] Quick links work
  - [ ] Back to Home button works

### 9b. Mobile Testing (Chrome DevTools / Real Devices)
- [ ] **Responsive Layout**
  - [ ] Navigation hamburger menu works
  - [ ] Nav menu opens/closes properly
  - [ ] Escape key closes mobile nav
  - [ ] Tool cards stack correctly on mobile
  - [ ] Forms and inputs are usable on mobile
  - [ ] No horizontal scroll on any page
- [ ] **Touch Interactions**
  - [ ] Buttons are tappable (44px minimum)
  - [ ] Sliders work with touch
  - [ ] Drag-and-drop works on mobile
  - [ ] Color pickers work on mobile
- [ ] **Viewport Testing**
  - [ ] Test at 320px width (iPhone SE)
  - [ ] Test at 375px width (iPhone 12/13/14)
  - [ ] Test at 414px width (iPhone Plus)
  - [ ] Test at 768px width (iPad)
  - [ ] Test at 1024px width (iPad Pro)

### 9c. Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome for Android

### 9d. Accessibility Testing
- [ ] All pages have skip links
- [ ] All images have `alt` attributes or `aria-hidden`
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader testing (VoiceOver / NVDA)
- [ ] Focus indicators visible
- [ ] ARIA labels present on buttons

---

## 10. Google Search Console Setup

- [ ] Go to [Google Search Console](https://search.google.com/search-console)
- [ ] Click **"Add property"**
- [ ] Choose **"URL prefix"** and enter: `https://multiweb.app`
- [ ] Verify ownership via one of these methods:
  - [ ] **HTML file upload:** Download verification file, add to root, push to GitHub
  - [ ] **HTML tag:** Add meta tag to `<head>` of `index.html`
  - [ ] **DNS record:** Add TXT record to DNS (most reliable)

### Submit Sitemap
- [ ] Go to **Sitemaps** in Search Console
- [ ] Enter: `https://multiweb.app/sitemap.xml`
- [ ] Click **Submit**
- [ ] Wait for Google to crawl (usually 1-3 days)

### Monitor Performance
- [ ] Check **Coverage** report for indexing issues
- [ ] Check **Core Web Vitals** for performance metrics
- [ ] Check **Mobile Usability** for mobile issues
- [ ] Monitor **Search Analytics** for traffic data

---

## 11. Google Analytics Setup

### Option A: Google Analytics 4 (GA4) — Recommended
- [ ] Go to [Google Analytics](https://analytics.google.com/)
- [ ] Click **"Admin"** → **"Create Property"**
- [ ] Set property name: "MultiWeb"
- [ ] Set timezone and currency
- [ ] Create a **Web data stream**
- [ ] Enter your URL: `https://multiweb.app`
- [ ] Enable **Enhanced measurement**
- [ ] Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)
- [ ] Add to all HTML files before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
- [ ] Verify tracking: Real-time reports should show your visits

### Option B: Privacy-Friendly Alternatives
Consider privacy-first alternatives (since MultiWeb emphasizes privacy):
- [ ] **Plausible Analytics** — `https://plausible.io` (paid, GDPR compliant)
- [ ] **Umami** — Self-hosted, open source
- [ ] **Fathom** — Simple, privacy-focused
- [ ] **Simple Analytics** — Privacy-first alternative

> **Note:** Since MultiWeb's privacy policy states "no tracking, no cookies", adding Google Analytics would require updating your privacy policy and adding a cookie consent notice.

---

## 12. Ad Placement Verification

Your current ad placeholders are **hidden** (commented out) in `index.html`. When you're ready to integrate ads:

### Ad Network Options
- [ ] **Google AdSense** — Most popular, requires approval
- [ ] **Ezoic** — AI-optimized ad placement
- [ ] **Mediavine** — Premium network (50K+ sessions/month)
- [ ] **Carbon Ads** — Developer-focused, lightweight

### Ad Placement Zones (Ready to Activate)
| Zone | Size | Location | Status |
|------|------|----------|--------|
| Zone 1 | 300×250 | Below tools grid | 🔲 Hidden |
| Zone 2 | 728×90 | Below tools grid | 🔲 Hidden |
| Zone 3 | 970×90 | Below tools grid | 🔲 Hidden |

### When Ready to Activate
- [ ] Uncomment ad section in `index.html`
- [ ] Replace placeholder HTML with ad network code
- [ ] Test ad rendering on all pages
- [ ] Verify ads don't break layout
- [ ] Check ad loading performance (lazy load if possible)
- [ ] Update privacy policy to disclose ad tracking

---

## 13. Post-Deployment Verification

### Final Checks
- [ ] Visit `https://multiweb.app` — loads correctly
- [ ] Visit `https://www.multiweb.app` — redirects to `multiweb.app`
- [ ] Visit `http://multiweb.app` — redirects to HTTPS
- [ ] Check SSL certificate is valid and trusted
- [ ] Run [Lighthouse Audit](https://web.dev/measure/) — aim for 90+ scores
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) — check Core Web Vitals
- [ ] Check all internal links work (no 404s)
- [ ] Check all external links work (Google Fonts, QRious CDN)
- [ ] Verify service worker is registered (DevTools → Application → Service Workers)
- [ ] Test offline functionality (DevTools → Network → Offline)
- [ ] Check robots.txt: `https://multiweb.app/robots.txt`
- [ ] Check sitemap: `https://multiweb.app/sitemap.xml`

---

## 14. SEO Verification

- [ ] All pages have unique `<title>` tags
- [ ] All pages have unique `<meta name="description">` tags
- [ ] All pages have Open Graph tags for social sharing
- [ ] All pages have Twitter Card tags
- [ ] All pages have structured data (JSON-LD)
- [ ] Canonical URLs are correct and consistent
- [ ] Internal linking structure is logical
- [ ] No orphan pages (every page reachable from navigation)

---

## 15. Ongoing Maintenance

### Weekly
- [ ] Check Google Search Console for errors
- [ ] Monitor site performance in analytics

### Monthly
- [ ] Update `sitemap.xml` `lastmod` dates for changed pages
- [ ] Review Core Web Vitals scores
- [ ] Check for broken links (use [Broken Link Checker](https://www.brokenlinkcheck.com/))
- [ ] Review and respond to user feedback

### Quarterly
- [ ] Update content if needed
- [ ] Review and update privacy policy
- [ ] Check for new web standards/best practices
- [ ] Audit accessibility compliance

---

## Quick Reference: Deployment Commands

```bash
# Initial setup
git init
git add .
git commit -m "Production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/multiweb.git
git push -u origin main

# Future updates
git add .
git commit -m "Description of changes"
git push

# Check deployment status
# Visit: https://github.com/YOUR_USERNAME/multiweb/actions
```

---

## ⚠️ Critical Issues to Fix Before Launch

1. **Sitemap URL Mismatch** — Clean URLs in sitemap don't match `.html` files
2. **Canonical URL Mismatch** — Meta tags use clean URLs, actual files use `.html`
3. **Service Worker Path** — Currently hardcoded to `/sw.js`; verify it works with custom domain

---

## ✅ What's Already Done

- [x] All 12 HTML pages created
- [x] Common CSS stylesheet (`common-styles.css`)
- [x] Common JavaScript (`common.js`) — theme, nav, FAQ
- [x] Service Worker (`sw.js`) — offline caching
- [x] SEO meta tags on all pages
- [x] Structured data (JSON-LD) on all pages
- [x] Open Graph tags for social sharing
- [x] Responsive design
- [x] Accessibility features (skip links, ARIA labels)
- [x] Privacy-first architecture (no tracking)
- [x] Bug fixes (percentage calculator, word unscrambler links, etc.)

---

*Generated for MultiWeb deployment on GitHub Pages — July 13, 2026*
