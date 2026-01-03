# Vercel Deployment Guide for ADOPT Studio

This guide explains how to deploy ADOPT Studio to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier available)
- Git repository connected to GitHub (already set up)
- Node.js 18+ installed locally (for testing)

## Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"

2. **Import Git Repository**
   - Select "Import Git Repository"
   - Choose your GitHub account and repository `amuzetnoM/adopt`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Select "Other" (custom Angular setup)
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run build` (already configured in vercel.json)
   - **Output Directory**: `dist` (already configured in vercel.json)
   - **Install Command**: `npm install` (already configured in vercel.json)

4. **Environment Variables** (Important!)
   - Click "Environment Variables"
   - Add `API_KEY` with your Google Gemini API key value
   - Add any other environment variables from `.env.example` as needed

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (typically 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (already installed in this project)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   npm run vercel:deploy
   # or directly: vercel
   ```

4. **Deploy to Production**
   ```bash
   npm run vercel:deploy:prod
   # or directly: vercel --prod
   ```

### Option 3: Automatic Deployments (After Initial Setup)

Once connected via the dashboard or CLI:
- **Every push to `main` branch**: Automatically deploys to production
- **Every push to other branches**: Creates a preview deployment
- **Every pull request**: Creates a preview deployment with a unique URL

## Configuration Files

This project includes the following Vercel-specific configuration:

### `vercel.json`
- Defines build and output settings
- Configures SPA routing (all routes → index.html)
- Sets security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Configures cache headers for static assets

### `.vercelignore`
- Excludes unnecessary files from deployment
- Similar to `.gitignore` but specific to Vercel

### `package.json` (Updated)
- Added `vercel` CLI to devDependencies
- Added deployment scripts:
  - `vercel-build`: Standard Vercel build command
  - `vercel:deploy`: Deploy preview
  - `vercel:deploy:prod`: Deploy to production

## Testing the Build Locally

Before deploying, you can test the production build locally:

```bash
# Build the project
npm run build

# Serve the dist folder locally (install serve if needed)
npx serve dist
```

Then visit `http://localhost:3000` to test the production build.

## Environment Variables

Make sure to configure these in Vercel Dashboard:

1. **API_KEY** (Required)
   - Your Google Gemini API key
   - Get one at: https://makersuite.google.com/app/apikey

2. Add any additional environment variables as needed for your deployment

## Troubleshooting

### Build Fails on Vercel

1. **Check Build Logs**: View detailed logs in Vercel dashboard
2. **Verify Node Version**: Ensure Vercel is using Node 18+ (configurable in dashboard)
3. **Environment Variables**: Make sure all required variables are set
4. **Local Test**: Run `npm run build` locally to catch errors early

### Routes Not Working (404 errors)

- The `vercel.json` configuration includes a rewrite rule to handle SPA routing
- All routes are directed to `index.html` for client-side routing
- This should work automatically with the provided configuration

### API Key Not Working

- Verify the environment variable is set in Vercel Dashboard
- Environment variables are case-sensitive
- Redeploy after adding/changing environment variables

### Build Warning: "SetupFormComponent is not used..."

- This is a warning, not an error
- The build still succeeds
- Can be safely ignored unless you want to clean up unused imports

## Performance Optimization

The deployment is optimized with:

✅ **Static Asset Caching**: 1 year cache for JS/CSS/images
✅ **Security Headers**: X-Frame-Options, X-XSS-Protection, etc.
✅ **CDN Distribution**: Vercel's global edge network
✅ **Automatic HTTPS**: SSL/TLS certificates included
✅ **Gzip/Brotli Compression**: Automatic compression for all assets

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (can take up to 48 hours)

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Angular Deployment Guide**: https://angular.dev/tools/cli/deployment
- **Project Issues**: Open an issue in the GitHub repository

## Quick Start Checklist

- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure build settings (or use vercel.json defaults)
- [ ] Add API_KEY environment variable
- [ ] Deploy!
- [ ] Test the deployment URL
- [ ] Set up automatic deployments (optional)
- [ ] Configure custom domain (optional)

---

**Ready to deploy?** Follow Option 1 above or simply run `npm run vercel:deploy:prod` after setting up the Vercel CLI!
