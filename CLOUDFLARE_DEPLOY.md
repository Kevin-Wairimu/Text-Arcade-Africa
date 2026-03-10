# Cloudflare Pages Deployment Guide

Your application is now fully prepared for Cloudflare Pages. Follow these steps to deploy:

## 1. Frontend Deployment (Cloudflare Pages)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and the branch you want to deploy.
4. Use the following **Build Settings**:
   - **Project Name:** `text-arcade-africa`
   - **Framework Preset:** `Vite` (or None)
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
   - **Root Directory:** `frontend`
5. **Environment Variables:**
   - In the "Settings" tab of your Pages project (after initial creation), add:
     - `VITE_API_URL`: `https://text-arcade-africa-0dj4.onrender.com`
     - `NODE_VERSION`: `20`

## 2. Verified Preparations

The following files have been configured to ensure Cloudflare compatibility:
- `frontend/public/_redirects`: Added `/* /index.html 200` to prevent 404s on page refresh.
- `frontend/public/robots.txt`: Updated to use the `.pages.dev` sitemap.
- `frontend/public/sitemap.xml`: Updated all links to your Cloudflare domain.
- `backend/server.js`: CORS policy updated to allow `text-arcade-africa.pages.dev` and all its preview subdomains.

## 3. SEO / Open Graph Previews
Since this is a Client-Side Rendered (CSR) app, social media previews (WhatsApp/Twitter) work best when using **Cloudflare Workers** or **Pages Functions** to inject meta tags. 

Your `ArticlesDetails.jsx` already includes the necessary tags for browsers, but for automated scrapers, the most professional next step is to enable a Cloudflare Worker to serve these tags.

---
**Ready to Deploy!** 🚀
