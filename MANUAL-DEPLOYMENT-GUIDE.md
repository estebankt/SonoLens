# Manual Deployment Guide

## Overview

You can now manually trigger deployments without pushing to the main branch using GitHub Actions.

---

## How to Manually Deploy

### Step 1: Go to GitHub Actions

1. Open your repository: https://github.com/estebankt/SonoLens
2. Click the **Actions** tab (top menu)
3. Select **CI/CD Pipeline** workflow (left sidebar)

### Step 2: Run Workflow

1. Click the **"Run workflow"** button (top right, blue button)
2. You'll see a dropdown with options:
   - **Branch:** Select which branch to deploy (usually `main`)
   - **Deployment environment:** Choose `production` or `staging`
3. Click **"Run workflow"** (green button)

### Step 3: Monitor Deployment

1. A new workflow run will appear
2. Click on it to see progress
3. Jobs will run in order:
   - ✅ Lint Code
   - ✅ Run Tests
   - ✅ Type Check and Build
   - ✅ Deploy to Production (or Staging)

---

## Use Cases

### 1. Re-deploy Production (No Code Changes)

**Scenario:** You updated environment variables in Vercel and need to redeploy.

**Steps:**
1. Go to Actions → CI/CD Pipeline → Run workflow
2. Branch: `main`
3. Environment: `production`
4. Run workflow

**Result:** Production redeploys with latest environment variables.

---

### 2. Deploy Specific Commit/Branch

**Scenario:** You want to deploy a feature branch to test it.

**Steps:**
1. Go to Actions → CI/CD Pipeline → Run workflow
2. Branch: `your-feature-branch`
3. Environment: `staging`
4. Run workflow

**Result:** Staging deployment from that branch.

---

### 3. Hotfix Deployment

**Scenario:** You need to deploy an urgent fix without waiting for CI on a PR.

**Steps:**
1. Create hotfix branch from `main`
2. Make the fix and push
3. Go to Actions → CI/CD Pipeline → Run workflow
4. Branch: `hotfix-branch`
5. Environment: `production`
6. Run workflow

**Result:** Tests run, then deploys to production if they pass.

---

### 4. Test Staging Without Creating PR

**Scenario:** You want to test changes in a staging environment.

**Steps:**
1. Push your branch
2. Go to Actions → CI/CD Pipeline → Run workflow
3. Branch: `your-branch`
4. Environment: `staging`
5. Run workflow

**Result:** Staging deployment without creating a PR.

---

## Automatic vs Manual Deployments

### Automatic Deployments (No Action Required)

| Event | Triggers | Result |
|-------|----------|--------|
| Push to `main` | Automatic | Deploys to production after tests pass |
| Create/Update PR | Automatic | Deploys to staging after tests pass |

### Manual Deployments (Via GitHub Actions UI)

| Action | Triggers | Result |
|--------|----------|--------|
| Run workflow → Production | Manual | Deploys selected branch to production |
| Run workflow → Staging | Manual | Deploys selected branch to staging |

**Note:** Automatic deployments still work! Manual trigger is an additional option.

---

## Important Notes

### ✅ Manual Deployments Still Run Tests

When you manually trigger a deployment:
1. ✅ Linting runs
2. ✅ Tests run
3. ✅ Type checking runs
4. ✅ Build runs
5. ✅ Only deploys if all pass

**You cannot skip tests** - this ensures deployment safety.

---

### ⚠️ Branch Selection

- **Production:** Usually deploy from `main` branch
- **Staging:** Can deploy from any branch
- **Caution:** Deploying non-`main` to production is allowed but unusual

---

### 🔒 Permissions

Only users with **write access** to the repository can manually trigger deployments.

---

## Workflow Trigger Comparison

### Before (Automatic Only)

```
┌─────────────────┐
│  Push to main   │ → Deploy to production ✅
└─────────────────┘

┌─────────────────┐
│   Create PR     │ → Deploy to staging ✅
└─────────────────┘

┌─────────────────┐
│ Update env vars │ → No deployment ❌
└─────────────────┘
```

### After (Automatic + Manual)

```
┌─────────────────┐
│  Push to main   │ → Deploy to production ✅
└─────────────────┘

┌─────────────────┐
│   Create PR     │ → Deploy to staging ✅
└─────────────────┘

┌─────────────────┐
│ Update env vars │ → Manual trigger → Deploy ✅
└─────────────────┘

┌─────────────────┐
│ Need hotfix     │ → Manual trigger → Deploy ✅
└─────────────────┘
```

---

## Examples

### Example 1: Redeploy After Vercel Config Change

```bash
# You updated SPOTIFY_CLIENT_ID in Vercel
# Want to redeploy without code changes

# Via GitHub UI:
1. Actions → CI/CD Pipeline
2. Run workflow
3. Branch: main
4. Environment: production
5. Click "Run workflow"

# Result: Fresh deployment with new env vars
```

---

### Example 2: Test Feature Branch in Staging

```bash
# You're working on feature-xyz branch
# Want to test in staging before creating PR

# Via GitHub UI:
1. Actions → CI/CD Pipeline
2. Run workflow
3. Branch: feature-xyz
4. Environment: staging
5. Click "Run workflow"

# Result: Staging deployment of your feature
```

---

### Example 3: Deploy from CLI (Advanced)

You can also trigger workflows via GitHub CLI:

```bash
# Install GitHub CLI first: https://cli.github.com/

# Deploy main to production
gh workflow run "CI/CD Pipeline" \
  --ref main \
  --field environment=production

# Deploy feature branch to staging
gh workflow run "CI/CD Pipeline" \
  --ref feature-xyz \
  --field environment=staging
```

---

## Monitoring Manual Deployments

### Via GitHub UI

1. Go to Actions tab
2. Find your workflow run (shows "workflow_dispatch" badge)
3. Click to see logs
4. Check deployment URL in logs

### Via Vercel Dashboard

1. Go to https://vercel.com/
2. Select **sono-lens** project
3. Click **Deployments** tab
4. Latest deployment should appear within 2-3 minutes

---

## Troubleshooting

### "Run workflow button is disabled"

**Cause:** You don't have write access to the repository.

**Fix:** Ask repository owner to grant you write access.

---

### "Workflow failed on lint/test"

**Cause:** Code has linting errors or failing tests.

**Fix:**
1. Check workflow logs for specific errors
2. Fix errors locally
3. Push fixes
4. Try manual trigger again

---

### "Deployment succeeded but changes not visible"

**Cause:** Browser cache or Vercel cache.

**Fix:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Wait 1-2 minutes for CDN propagation
3. Check Vercel deployment URL directly

---

### "Manual trigger deploys wrong branch"

**Cause:** Selected wrong branch in dropdown.

**Fix:**
1. Check deployment logs for actual branch deployed
2. Re-run workflow with correct branch selected

---

## Security Considerations

### ✅ Safe Practices

- Deploy `main` to production (after PR merge)
- Deploy feature branches to staging only
- Always let tests run (don't skip)
- Review workflow logs before confirming success

### ⚠️ Risky Practices (Avoid)

- Deploying unreviewed code to production
- Deploying from personal branches to production
- Skipping tests (not possible with this setup)
- Deploying without checking what changed

---

## Quick Reference

### Manual Deploy Production

```
1. Actions → CI/CD Pipeline
2. Run workflow
3. main + production
4. Run workflow
```

### Manual Deploy Staging

```
1. Actions → CI/CD Pipeline
2. Run workflow
3. any-branch + staging
4. Run workflow
```

### Check Deployment Status

```
1. Actions → View workflow run
2. Or: Vercel Dashboard → Deployments
```

---

## Summary

**You now have 3 ways to deploy:**

1. **Automatic (Push to main)** → Production deployment
2. **Automatic (Create PR)** → Staging deployment
3. **Manual (Run workflow)** → Choose branch + environment ✅ NEW

All methods run full CI/CD pipeline (lint, test, build, deploy).

---

**Last Updated:** 2025-11-26
