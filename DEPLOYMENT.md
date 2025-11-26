# Deployment Guide - SonoLens

This guide covers deploying SonoLens to Vercel with GitHub Actions CI/CD.

---

## Prerequisites

- GitHub repository with push access
- Vercel account linked to GitHub
- Vercel project created (already linked: `sono-lens`)

---

## Step 1: Add GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

### VERCEL_TOKEN
```
2AmWeVrquVI394tmq6iPGcME
```
**Get from:** https://vercel.com/account/tokens

### VERCEL_ORG_ID
```
team_ARbsyjrYlTHwepLS4JqtiVRm
```
**From:** `.vercel/project.json` after running `npx vercel link`

### VERCEL_PROJECT_ID
```
prj_rHoh5Z8KAZA1minsWVjwPjtAC4CA
```
**From:** `.vercel/project.json` after running `npx vercel link`

### SPOTIFY_CLIENT_ID
```
your_spotify_client_id_here
```
**Get from:** https://developer.spotify.com/dashboard

### OPENAI_API_KEY
```
your_openai_api_key_here
```
**Get from:** https://platform.openai.com/api-keys

---

## Step 2: Configure Vercel Environment Variables

Go to Vercel Dashboard: **Project Settings → Environment Variables**

### Production Environment

Add these variables for **Production** environment:

| Variable | Value | Environment |
|----------|-------|-------------|
| `SPOTIFY_CLIENT_ID` | *(Your Spotify Client ID)* | Production |
| `SPOTIFY_REDIRECT_URI` | `https://sono-lens.vercel.app/auth/callback` | Production |
| `OPENAI_API_KEY` | *(Your OpenAI API Key)* | Production |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production |

### Preview Environment

Add these variables for **Preview** environment:

| Variable | Value | Environment |
|----------|-------|-------------|
| `SPOTIFY_CLIENT_ID` | *(Your Spotify Client ID)* | Preview |
| `SPOTIFY_REDIRECT_URI` | *(See note below)* | Preview |
| `OPENAI_API_KEY` | *(Your OpenAI API Key)* | Preview |
| `OPENAI_MODEL` | `gpt-4o-mini` | Preview |

**Note on Preview `SPOTIFY_REDIRECT_URI`:**
Preview deployments get dynamic URLs like `https://sono-lens-abc123.vercel.app`. You have two options:

1. **Option A: Wildcard (if Spotify supports it)**
   - Add to Spotify Dashboard: `https://*.vercel.app/auth/callback`

2. **Option B: Fixed staging subdomain (recommended)**
   - In Vercel: Settings → Domains → Add a custom preview domain
   - Example: `staging.yourdomain.com`
   - Use: `https://staging.yourdomain.com/auth/callback`

3. **Option C: Use production redirect for testing**
   - Use: `https://sono-lens.vercel.app/auth/callback`
   - Less ideal but works for initial testing

---

## Step 3: Update Spotify Dashboard

Go to Spotify Developer Dashboard: https://developer.spotify.com/dashboard

1. Select your app
2. Click "Edit Settings"
3. Add to "Redirect URIs":
   - `https://sono-lens.vercel.app/auth/callback` (production)
   - `https://*.vercel.app/auth/callback` (preview - if supported)
   - OR your custom staging domain

4. Click "Save"

---

## Step 4: Test the Deployment

### Test Production Deployment

Current push to `main` will trigger production deployment automatically.

1. Go to GitHub Actions tab
2. Watch the "CI/CD Pipeline" workflow
3. Jobs should run in order:
   - ✅ Lint Code
   - ✅ Run Tests
   - ✅ Type Check and Build
   - ✅ Deploy to Production

4. Once complete, visit: `https://sono-lens.vercel.app`

### Test Staging Deployment

1. Create a new branch:
   ```bash
   git checkout -b test-deployment
   ```

2. Make a small change (e.g., add a comment)

3. Push and create PR:
   ```bash
   git add .
   git commit -m "test: Validate staging deployment"
   git push -u origin test-deployment
   ```

4. Create PR on GitHub
5. Watch GitHub Actions run
6. Check PR comment for preview URL
7. Test the preview deployment

---

## Step 5: Verify Deployment

### Production Checklist

- [ ] Site loads at `https://sono-lens.vercel.app`
- [ ] "Login with Spotify" button works
- [ ] OAuth redirect completes successfully
- [ ] Dashboard shows user profile
- [ ] Image upload works
- [ ] AI analysis completes
- [ ] Playlist generation works
- [ ] Save to Spotify works

### Staging Checklist

- [ ] Preview URL in PR comment works
- [ ] OAuth flow works with preview URL
- [ ] All features work as expected

---

## Troubleshooting

### Issue: GitHub Actions fails with "VERCEL_TOKEN not found"

**Solution:** Check that all GitHub Secrets are added correctly (exact names, no typos)

### Issue: Vercel deployment succeeds but site shows errors

**Solution:**
1. Check Vercel Dashboard → Deployments → Click deployment → View Logs
2. Verify environment variables are set in Vercel
3. Check for missing environment variables

### Issue: Spotify OAuth fails with "redirect_uri_mismatch"

**Solution:**
1. Check exact URL in Spotify Dashboard matches deployment URL
2. Ensure trailing `/auth/callback` is included
3. Verify protocol is `https://` not `http://`

### Issue: OpenAI API errors in production

**Solution:**
1. Verify `OPENAI_API_KEY` is set correctly in Vercel
2. Check API key has sufficient credits
3. Review Vercel function logs for detailed errors

### Issue: Preview deployments don't work

**Solution:**
1. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
2. Verify Vercel token has deployment permissions
3. Check GitHub Actions logs for specific error messages

---

## CI/CD Pipeline Details

### Workflow Triggers

- **Push to main:** Runs full pipeline + production deployment
- **Pull requests:** Runs full pipeline + staging deployment

### Job Dependencies

```
lint ──┐
       ├─→ build ──┐
test ──┘           ├─→ deploy-production (main only)
                   └─→ deploy-staging (PRs only)
```

### Environment Variables in CI

The workflow uses test values for build/test:
- `SPOTIFY_CLIENT_ID: test_client_id`
- `OPENAI_API_KEY: test_openai_key`
- `OPENAI_MODEL: gpt-4o-mini`

Real values are injected by Vercel during deployment.

---

## Monitoring & Logs

### GitHub Actions Logs
- Go to: Repository → Actions → Select workflow run
- View logs for each job
- Check for failures or warnings

### Vercel Deployment Logs
- Go to: Vercel Dashboard → Deployments
- Click on deployment → View Function Logs
- Check runtime logs and errors

### Vercel Analytics (Optional)
- Enable in Vercel Dashboard → Analytics
- Track page views, performance, errors

---

## Rollback Procedure

If a deployment breaks production:

1. **Quick rollback via Vercel:**
   ```bash
   # In Vercel Dashboard → Deployments
   # Find previous working deployment
   # Click "..." → Promote to Production
   ```

2. **Rollback via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Emergency fix:**
   ```bash
   # Fix the issue locally
   git commit -m "fix: Emergency production fix"
   git push origin main
   ```

---

## Security Best Practices

✅ **What we did right:**
- Environment variables stored in GitHub Secrets
- Vercel environment variables encrypted
- No secrets in source code
- HTTPS-only in production

⚠️ **Additional recommendations:**
- Rotate API keys periodically
- Use different API keys for production/preview
- Enable Vercel Authentication for preview deployments
- Set up Vercel password protection for staging

---

## Cost Monitoring

### Vercel Free Tier Limits
- 100GB bandwidth/month
- 6000 build minutes/month
- 100GB-hrs serverless function execution

### GitHub Actions Free Tier
- 2000 minutes/month (private repos)
- Unlimited for public repos

### Current Usage (estimated)
- Each deployment: ~2-3 minutes
- Average monthly deployments: 20-30
- Well within free tier limits

---

## Next Steps

After successful deployment:

1. **Custom Domain (Optional)**
   - Add custom domain in Vercel
   - Update `SPOTIFY_REDIRECT_URI` accordingly
   - Update Spotify Dashboard redirect URIs

2. **Monitoring**
   - Set up Sentry or similar error tracking
   - Enable Vercel Analytics
   - Monitor API usage (OpenAI, Spotify)

3. **Performance**
   - Run Lighthouse audit
   - Optimize images
   - Enable Vercel Edge Functions if needed

4. **Testing**
   - Add E2E tests with Playwright
   - Test OAuth flow end-to-end
   - Load test with realistic usage

---

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions
- **SvelteKit Deployment:** https://kit.svelte.dev/docs/adapters
- **Spotify API:** https://developer.spotify.com/documentation
- **OpenAI API:** https://platform.openai.com/docs

---

**Last Updated:** 2025-11-25
**Pipeline Version:** v1.0.0
