/**
 * OWNLAY Marketing OS - Main Application Entry Point
 * Version: 7.0.0 - Dual Database Architecture (D1 + PostgreSQL)
 * 
 * DATABASE ARCHITECTURE:
 * - D1 (SQLite): Authentication & Registration ONLY
 * - PostgreSQL (via Hyperdrive): ALL business data
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-pages'

// Import route handlers
import { marketingRoutes } from './routes/marketing'
import { productRoutes } from './routes/product'
import { apiRoutes } from './routes/api'
import { docsRoutes } from './routes/docs'
import { onboardingRoutes } from './routes/onboarding'
import { adminRoutes } from './routes/admin'
import { authRoutes } from './routes/auth'
import { influencerRoutes } from './routes/influencer'
import { agentRoutes } from './routes/agents'
import { observabilityRoutes } from './routes/observability'
import { paymentRoutes } from './routes/payment'

// Hyperdrive type for PostgreSQL connection pooling
interface Hyperdrive {
  connectionString: string;
}

// Define bindings type for Cloudflare services
type Bindings = {
  // D1 Database - ONLY for Authentication/Registration
  DB: D1Database;
  
  // PostgreSQL via Hyperdrive - For ALL business data
  HYPERDRIVE?: Hyperdrive;
  
  // Optional: Direct PostgreSQL connection string (fallback)
  DATABASE_URL?: string;
  
  // Environment
  ENVIRONMENT?: string;
  
  // Cloudflare Workers AI
  AI?: unknown;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Serve React app assets (CSS, JS chunks)
app.use('/app/assets/*', serveStatic({ root: './public' }))

// React SPA is ONLY used for the homepage (/)
// All other pages (auth, dashboard, etc.) use server-side rendering
// This preserves the old functionality while keeping the new homepage design

// Serve favicon at root level
app.get('/favicon.svg', (c) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">O</text>
</svg>`
    return c.body(svg, 200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000' })
})

// Serve favicon.ico (redirect to svg)
app.get('/favicon.ico', (c) => {
    return c.redirect('/favicon.svg', 301)
})

// Serve PNG favicons (base64 encoded for simplicity - purple gradient with O)
// These are fallbacks for browsers that don't support SVG favicons
app.get('/favicon-32.png', (c) => {
    // Simple 32x32 purple square PNG with "O" - base64 encoded
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABZUlEQVR4nO2WPU7DQBCFP0KENFRIlJRQ0HAC7kBNQ8ENKA9UXIGSghtQUqSioKDgBpyANm4oKEJBgkT8xIpGYpXdzbqxLGt5zavs+c2b2Z0dOCFKwBJwDUyZ9wkYAHeAD4t+BrgH5oA/hvlToAdsGu8OuALsA1vACGiZ/B7wYJo8cQz0gFNgR4KH4HdMnhsH+uZxN4DvQA/YltBTu4hWRQfAYSFRbAl94LKCKJ2U2A4q1yZ0o3OWi/oqkFtC7xywUFBCq4zXB9qqj6k5/wV0U2InnDEJP7AE/gBzCdRSwqMkfAl5sQYe8/8n4CuKNaOG2Kk2sEmsbwq4SYiNmwJrWwI/gfslUKsE2kq4qRJbD7wt2J6u4HZZwm0VbKQE94C1gmXYE3gJHKbEjoA1oFMi6JqAM+AE+JNAdwncJqwfK4HHynpOwttKvK8StlRwp0pYq+xRYD0htgksVREuAW+A5bLCvwGTYJYoXpFuzQAAAABJRU5ErkJggg=='
    const buffer = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0))
    return c.body(buffer, 200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' })
})

app.get('/favicon-16.png', (c) => {
    // Simple 16x16 purple square PNG - base64 encoded  
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAjklEQVR4nGNgGAWjYBQMKGBkwCL4HxlDFGAnA5J8MIj4f2zyxBhCFCBJgJDwfxLl0V0AMYQBWRKbAUQZQqwBxBhClAHEOJ9oA0h1PkkGkOp8og0g1fkEDSDH+QQNIOX5qBqIdj5RGkg1gGjnk+p8dAPIcj7BBuBzPkLjfwb850GcT6j1JDufVANGwSgYBAAAU08lQaB3xV0AAAAASUVORK5CYII='
    const buffer = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0))
    return c.body(buffer, 200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' })
})

app.get('/apple-touch-icon.png', (c) => {
    // Redirect to SVG for apple touch icon
    return c.redirect('/favicon.svg', 301)
})

// Robots.txt - Allow search engines to crawl the site
app.get('/robots.txt', (c) => {
    const robotsTxt = `# OWNLAY Marketing OS - robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /app/
Disallow: /admin/
Disallow: /auth/

# Sitemaps
Sitemap: https://ownlay.com/sitemap.xml

# Crawl-delay (optional, be nice to crawlers)
Crawl-delay: 1
`
    return c.body(robotsTxt, 200, { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' })
})

// Sitemap.xml - Help search engines discover pages
app.get('/sitemap.xml', (c) => {
    const baseUrl = 'https://ownlay.com'
    const today = new Date().toISOString().split('T')[0]
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/features</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/pricing</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/about</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${baseUrl}/contact</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${baseUrl}/docs</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${baseUrl}/auth/login</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${baseUrl}/auth/register</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>`
    return c.body(sitemap, 200, { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' })
})

// Mount route modules
app.route('/', marketingRoutes)
app.route('/app', productRoutes)
app.route('/api/v1', apiRoutes)
app.route('/docs', docsRoutes)

// Redirect /api to /docs/api (documentation)
app.get('/api', (c) => c.redirect('/docs/api', 301))
app.route('/onboarding', onboardingRoutes)
app.route('/admin', adminRoutes)
// Handle trailing slash for /admin/
app.get('/admin/', (c) => {
    return c.redirect('/admin', 301)
})
app.route('/auth', authRoutes)
app.route('/influencer', influencerRoutes)
app.route('/creator', influencerRoutes) // Alias for /influencer routes
app.route('/api/v1/agents', agentRoutes) // Multi-tenant agentic system
app.route('/api/v1/observability', observabilityRoutes) // Decision logs, activity feed, approvals, predictions
app.route('/api/v1/payment', paymentRoutes) // Payment, subscription, and plan management
app.route('/api/v1/admin', adminRoutes) // Admin management for brands and agencies

export default app
