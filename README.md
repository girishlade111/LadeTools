# LadeTools 🧰⚡

> **Fast, Privacy-First, 100% Client-Side Developer Toolbox**  
> *Nothing leaves your browser. Zero telemetry. IndexedDB offline persistence. Installable PWA.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 🚀 Overview

**LadeTools** is a modern suite of developer utilities designed for maximum speed, security, and privacy. Every single computation, transformation, regex evaluation, and token decode runs directly inside your browser memory. 

- **100% Client-Side:** No server uploads, APIs, or data telemetry. Safe for internal API tokens, passwords, and sensitive production data.
- **Offline PWA:** Fully cached service worker architecture allows the complete toolbox to function without an active internet connection.
- **IndexedDB Local History:** History is stored locally in your browser's IndexedDB via [Dexie.js](https://dexie.org/), complete with 20-item auto-trimming and consecutive deduplication.
- **Dark & Light Mode:** System-aware, high-contrast dark and light themes with smooth glassmorphism accents.

---

## 🛠️ Included Developer Tools

| Tool | Features & Capabilities |
| :--- | :--- |
| **JSON Formatter & Validator** | Live syntax linting, line/column error detection, recursive collapsible tree view, 2/4-space pretty printing, and single-line minification. |
| **Base64 Encoder & Decoder** | Full UTF-8 Unicode and emoji support via `TextEncoder`/`TextDecoder`, small file upload (<1MB) with Data URI / raw format options. |
| **JWT Token Decoder** | Base64URL offline parser, claims expiration calculation (`Active` vs `Expired`), standard claims highlight (`exp`, `iat`, `sub`), syntax-highlighted code and tree inspection. |
| **Regex Tester & Evaluator** | Interactive flags (`g`, `i`, `m`, `s`, `u`), XSS-safe live DOM highlight marks, numbered & named capture group extraction, and preset pattern library. |
| **UUID & Timestamp Utility** | Cryptographically secure `crypto.randomUUID()` generation with uppercase/hyphen toggles, batch creation (+5/+10/+20), two-way Unix seconds/ms auto-detection, and visual date picker. |

---

## 📋 Production Deployment Checklist

Before deploying to production, review the following items:

- [x] **Production Bundle Validation:** Run `npm run build` to confirm 0 TypeScript or bundler errors.
- [x] **SPA Routing Rules:** Verify `vercel.json`, `netlify.toml`, or `public/_redirects` are in place.
- [x] **PWA Manifest & Icons:** Ensure `manifest.webmanifest`, `pwa-192x192.png`, `pwa-512x512.png`, and `maskable-icon-512x512.png` are valid.
- [ ] **Donation / Sponsorship URL:** Update `DONATION_URL` in [src/components/support-footer.tsx](src/components/support-footer.tsx) with your real GitHub Sponsors or BuyMeACoffee link.
- [ ] **Custom Domain in SEO Tags:** Update canonical URL in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your production domain (e.g., `https://ladetools.dev` or `https://tools.yourdomain.com`).

---

## ⚡ Deployment Guides

### 1. Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. The project uses standard Vite settings (automatically detected via `vercel.json`):
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

### 2. Deploy to Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. The `netlify.toml` file will automatically configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **SPA Redirects:** `/* -> /index.html 200`
3. Click **Deploy Site**.

### 3. Deploy to Cloudflare Pages
1. In the Cloudflare dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. `public/_redirects` and `public/_headers` are automatically deployed.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/girishlade111/LadeTools.git
cd LadeTools

# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Privacy Guarantee

LadeTools is architected on a zero-backend model. No network requests are made when processing your data, and no third-party tracking scripts are executed. All history items are stored purely inside your browser's local sandbox.

---

## 📄 License

MIT License &copy; 2026 Girish Lade. Free and open source for everyone.

---

**Built by [Girish Lade](https://github.com/girishlade111)** — part of the [LadeStack](https://ladestack.in) family of free, open-source tools.
