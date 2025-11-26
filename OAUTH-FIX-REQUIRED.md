# 🚨 OAUTH FIX REQUIRED - Environment Variable Name Mismatch

## Problem Identified

The `INVALID_CLIENT` error is caused by **incorrect environment variable names** in Vercel.

### What's Wrong:

You likely used these names in Vercel:
```
SPOTIFY_REDIRECT_URI_PRODUCTION  ❌ WRONG
SPOTIFY_REDIRECT_URI_PREVIEW     ❌ WRONG
```

But the code expects:
```
SPOTIFY_REDIRECT_URI  ✅ CORRECT
```

---

## Quick Fix (5 minutes)

### Step 1: Go to Vercel

1. Open: https://vercel.com/
2. Select project: **sono-lens**
3. Click: **Settings** → **Environment Variables**

### Step 2: Delete Wrong Variables (if they exist)

If you see these, **delete them**:
- `SPOTIFY_REDIRECT_URI_PRODUCTION`
- `SPOTIFY_REDIRECT_URI_PREVIEW`

### Step 3: Add Correct Variables

**For PRODUCTION environment:**

Click "Add New" → Fill in:
```
Name:  SPOTIFY_REDIRECT_URI
Value: https://sono-lens.vercel.app/auth/callback
```
✅ Check: **Production**

**For PREVIEW environment:**

Click "Add New" → Fill in:
```
Name:  SPOTIFY_REDIRECT_URI
Value: https://sono-lens.vercel.app/auth/callback
```
✅ Check: **Preview**

### Step 4: Verify All Environment Variables

Make sure you have these **4 variables** for both Production and Preview:

| Variable Name | Production Value | Preview Value |
|---------------|------------------|---------------|
| `SPOTIFY_CLIENT_ID` | `223858754ec542f18c9494cb3ced216b` | `223858754ec542f18c9494cb3ced216b` |
| `SPOTIFY_REDIRECT_URI` | `https://sono-lens.vercel.app/auth/callback` | `https://sono-lens.vercel.app/auth/callback` |
| `OPENAI_API_KEY` | `sk-proj-fXHhUUgm7L...` | `sk-proj-fXHhUUgm7L...` |
| `OPENAI_MODEL` | `gpt-4o-mini` | `gpt-4o-mini` |

### Step 5: Redeploy

1. Go to: **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

### Step 6: Test

Visit: https://sono-lens.vercel.app

Expected flow:
1. Click "Login with Spotify"
2. Redirects to Spotify authorization
3. Click "Agree"
4. Redirects back to dashboard
5. Shows your Spotify profile ✅

---

## Why This Happened

The documentation in `setup-github-secrets.md` originally showed:
```
SPOTIFY_REDIRECT_URI_PRODUCTION=...
SPOTIFY_REDIRECT_URI_PREVIEW=...
```

This was a **documentation error**. The code uses:
```typescript
import { SPOTIFY_REDIRECT_URI } from '$env/static/private';
```

So the variable name **must be exactly** `SPOTIFY_REDIRECT_URI` (no suffix).

---

## Verification Checklist

Before testing, verify:

- [ ] Variable name is `SPOTIFY_REDIRECT_URI` (not `SPOTIFY_REDIRECT_URI_PRODUCTION`)
- [ ] Variable is set for **both** Production and Preview environments
- [ ] Value is `https://sono-lens.vercel.app/auth/callback` (with https://)
- [ ] `SPOTIFY_CLIENT_ID` is `223858754ec542f18c9494cb3ced216b`
- [ ] Redeployed after making changes
- [ ] Waited 1-2 minutes for deployment to complete

---

## If Still Not Working

1. Check Vercel Function Logs:
   - Dashboard → Deployments → Click deployment → **Function Logs**
   - Look for error messages

2. Check browser Network tab:
   - Open DevTools → Network
   - Click "Login with Spotify"
   - Inspect the redirect URL parameters

3. Verify Spotify Dashboard redirect URI:
   - Must be: `https://sono-lens.vercel.app/auth/callback`
   - Exact match (no trailing slash)

---

**Status:** Waiting for Vercel environment variable fix
**Next:** Redeploy and test OAuth flow

**Updated:** 2025-11-26
