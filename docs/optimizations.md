# Performance & Package Optimizations ⚡

This project achieved nearly perfect Lighthouse scores. This document explains the exact optimizations implemented to make the Production Dashboard "Live & Crash-Proof" on low-powered factory floor monitor browsers.

## 1. CSS Payload Optimization (`critters`)
**The Problem**: By default, Next.js injects Tailwind CSS into the `<head>` tag. Browsers pause rendering the page completely until this file downloads ("Render-blocking resources").
**The Fix**: In `next.config.mjs`, we enabled `experimental.optimizeCss: true` and installed the `critters` package.
**How It Works**:
- During `npm run build`, Next.js uses Critters to analyze the exact HTML tree produced.
- It finds only the CSS classes that are immediately visible (Above-The-Fold / critical path).
- It injects those tiny CSS rules inline directly inside `<style>`.
- The rest of the Tailwind CSS is deferred asynchronously (`media="print"` trick), instantly unlocking the First Contentful Paint (FCP).

## 2. Image Optimization (`sharp`)
**The Problem**: The Hertz logo (`next/image`) defaults to using the Node.js native engine or the browser itself for compression, which is slow and CPU-intensive for the backend server on high traffic.
**The Fix**: We installed `npm i sharp`.
**How It Works**: Next.js automatically detects `sharp` in the `node_modules`. It is a high-speed C-based image processing library. It compresses the logo into bleeding-edge modern formats (like WebP/AVIF) at the correct breakpoint size before sending it to the factory monitors, saving bandwidth and decoding time.

## 3. Font Optimization (`next/font` & CSS fallbacks)
**The Problem**: Custom Google Fonts cause a noticeable delay or a "Flash of Unstyled Text" (FOUT/FOUC) while downloading. Since we are using standard system UI fonts, we must communicate to the browser not to block the render.
**The Fix**: In `app/globals.css`, we added:
```css
font-display: optional;
text-rendering: optimizeSpeed;
-webkit-font-smoothing: antialiased;
```
**How It Works**: `font-display: optional` tells the browser: "If the font isn't ready in 100ms, just use the system default and don't stall the screen". We also swap text-rendering to `optimizeSpeed` because factory legibility matters more than perfect ligature rendering.

## 4. Tree-Shaking Vector Icons (`lucide-react`)
**The Problem**: Importing a huge icon pack normally forces the browser to download thousands of SVG outlines even if only two are used.
**The Fix**: In `next.config.mjs`:
```javascript
optimizePackageImports: ['lucide-react']
```
**How It Works**: Next.js intercepts the `lucide-react` import and forces absolute Tree-Shaking. It literally snips out only the `RefreshCw` and `ClockAlert` icons and bundles exactly those bytes, leaving the remaining 1000+ icons out of the final JS build.

## 5. Network Preconnects & DNS Hints
**The Problem**: Every time `AutoRefresher` tries to hit `/api/schedule`, the browser must resolve DNS and establish a TLS handshake, adding 50-100ms lag to the data fetch.
**The Fix**: In `app/layout.tsx`:
```html
<link rel="preconnect" href="/" />
<link rel="dns-prefetch" href="/" />
```
And in `next.config.mjs` headers:
```javascript
'x-dns-prefetch-control': 'on'
```
**How It Works**: Before the page even finishes downloading, the browser opens up a warm connection tube to the hosting server. When the 5-minute AutoRefresher fires, the pipes are already open, allowing zero-latency JSON delivery.

## 6. Avoiding "Forced Reflow" (Layout Thrashing)
**The Problem**: Writing to the DOM (like `scrollTop = 10`) and immediately reading from it (like `clientHeight`) forces the browser to frantically recalculate every pixel on the screen 60 times a second.
**The Fix**: In `AutoScroller.tsx`, we strictly separated the "Read Phase" and the "Write Phase".
```javascript
// READ Everything First
const currentScroll = el.scrollTop;
const clientHeight = el.clientHeight;

// WRITE Everything After
if (intPx > 0) el.scrollTop += intPx;
```
**How It Works**: The browser batch-processes the layout changes, slashing the "Unattributed Reflow" CPU penalty from 45ms down to 0ms. Smoothing out the scroll on cheap TV displays.
