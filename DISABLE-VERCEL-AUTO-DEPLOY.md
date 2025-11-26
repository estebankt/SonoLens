# Disable Vercel Auto-Deploy

## Goal
Prevent Vercel from automatically deploying on every push to main. Only deploy via GitHub Actions CI/CD pipeline.

---

## Steps to Disable Vercel Git Integration

### Option 1: Disable Auto-Deploy for Production Only (Recommended)

This keeps PR previews but disables auto-deploy to production:

1. Go to: https://vercel.com/
2. Select project: **sono-lens**
3. Click: **Settings** → **Git**
4. Scroll to: **Production Branch**
5. **Uncheck:** "Automatically deploy the production branch"
6. Click: **Save**

**Result:**
- ✅ GitHub Actions will deploy to production (via workflow)
- ✅ PRs will still get preview deployments from Vercel
- ❌ Pushes to `main` won't trigger Vercel deployments

---

### Option 2: Disable All Auto-Deployments (Nuclear Option)

This disables both production AND preview deployments:

1. Go to: https://vercel.com/
2. Select project: **sono-lens**
3. Click: **Settings** → **Git**
4. Click: **Disconnect** (under "Connected Git Repository")

**Result:**
- ✅ GitHub Actions controls ALL deployments
- ❌ No preview deployments for PRs from Vercel
- ⚠️ Only use if you want 100% GitHub Actions control

---

### Option 3: Ignored Build Step (Conditional Deployment)

Keep Git integration but control when Vercel builds:

1. Go to: https://vercel.com/
2. Select project: **sono-lens**
3. Click: **Settings** → **Git**
4. Scroll to: **Ignored Build Step**
5. Select: **Don't build anything**
6. Click: **Save**

**Custom Ignore Script (Advanced):**
Create `vercel-ignore.sh` in project root:
```bash
#!/bin/bash
# Only build if not triggered by GitHub Actions
# (GitHub Actions will handle deployments)
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  echo "🛑 Skipping Vercel build - GitHub Actions will deploy"
  exit 0  # Don't build
else
  echo "✅ Building preview deployment"
  exit 1  # Build
fi
```

Then in Vercel Settings → Git → Ignored Build Step:
```
bash vercel-ignore.sh
```

---

## Recommended Approach

**Use Option 1** (Disable Production Auto-Deploy) because:
- ✅ You keep PR preview deployments (helpful for testing)
- ✅ Production only deploys after tests pass in GitHub Actions
- ✅ No duplicate deployments to production
- ✅ Simple to configure (just one checkbox)

---

## Verification

After disabling auto-deploy:

### Test Production (Should NOT Deploy):
1. Make a small change to README
2. Commit and push to `main`
3. Check Vercel Dashboard → Deployments
   - ❌ Should NOT see a new deployment from Vercel
   - ✅ Should only see deployment from GitHub Actions

### Test PR Preview (Should Still Deploy):
1. Create a branch and PR
2. Push changes
3. Check Vercel Dashboard → Deployments
   - ✅ Should see preview deployment (if Option 1)
   - ❌ Should NOT see preview deployment (if Option 2)

---

## Current CI/CD Flow

### With Option 1 (Recommended):

```
Push to main
    ↓
┌─────────────────────────────┐
│  Vercel Git Integration     │ ← DISABLED FOR PRODUCTION
│  (No deployment triggered)  │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  GitHub Actions Workflow    │ ← ONLY THIS RUNS
│  - Lint                     │
│  - Test                     │
│  - Build                    │
│  - Deploy to Production     │
└─────────────────────────────┘
    ↓
Production Live! ✅


Create PR
    ↓
┌─────────────────────────────┐
│  Vercel Git Integration     │ ← STILL ENABLED FOR PREVIEWS
│  (Creates preview)          │
└─────────────────────────────┘
    AND
┌─────────────────────────────┐
│  GitHub Actions Workflow    │ ← ALSO RUNS
│  - Lint                     │
│  - Test                     │
│  - Build                    │
│  - Deploy to Staging        │
└─────────────────────────────┘
    ↓
Preview URLs from both! ✅
```

**Note:** You'll get two preview URLs per PR:
1. From Vercel Git integration (automatic)
2. From GitHub Actions workflow (after tests pass)

This is fine - you can use either one for testing.

---

## Alternative: Keep Both, Accept Duplicates

If you're okay with duplicate deployments:

**Do nothing!** Just accept that:
- Vercel deploys immediately on push
- GitHub Actions deploys after tests pass
- Both go to the same production URL (last one wins)

**Pros:**
- Faster deployments (no waiting for tests)
- Redundancy (if one fails, other might succeed)

**Cons:**
- Duplicate builds (costs more)
- Might deploy broken code (if tests would have failed)

---

## Troubleshooting

### "I disabled auto-deploy but Vercel still deploys"

**Possible causes:**
1. You disabled the wrong setting - check **Production Branch** setting
2. Deployment is from GitHub Actions (expected!) - check deployment source
3. Cache - wait a few minutes and try again

### "PR previews stopped working"

**Cause:** You chose Option 2 (full disconnect) instead of Option 1

**Fix:**
- Re-connect Git integration in Vercel
- Use Option 1 instead (just disable production auto-deploy)

---

## Summary

**Recommended Setup:**

| Event | Vercel Auto-Deploy | GitHub Actions |
|-------|-------------------|----------------|
| Push to `main` | ❌ Disabled | ✅ Deploys to production |
| Create PR | ✅ Enabled (preview) | ✅ Deploys to staging |
| Merge PR | ❌ Disabled | ✅ Deploys to production |

**Action Required:**
1. Go to Vercel Dashboard
2. Settings → Git
3. Uncheck "Automatically deploy the production branch"
4. Save

Done! 🎉

---

**Last Updated:** 2025-11-26
