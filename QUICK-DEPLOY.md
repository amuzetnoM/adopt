# Quick Deploy to Vercel 🚀

This project is ready to deploy to Vercel! Choose your preferred method:

## Method 1: Via Vercel Dashboard (Easiest - 2 minutes)

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import repository: `amuzetnoM/adopt`
4. **Add Environment Variable**: `API_KEY` = your Google Gemini API key
5. Click **"Deploy"**
6. Done! Your app is live at `https://your-project.vercel.app`

Vercel will use the configuration in `vercel.json` automatically.

## Method 2: Via CLI (For Developers)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
npm run vercel:deploy:prod
```

## Need Help?

See the complete guide: [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

## What's Included?

✅ Vercel CLI (v50.1.3) installed  
✅ `vercel.json` configured for SPA routing  
✅ Security headers enabled  
✅ Static asset caching optimized  
✅ Build tested and working  

## Important Notes

- **API Key Required**: Add your Gemini API key as environment variable in Vercel Dashboard
- **Automatic Deployments**: After initial setup, every push to `main` auto-deploys
- **Preview URLs**: Pull requests get unique preview URLs automatically

---

**Ready?** Just follow Method 1 above - it's that simple!
