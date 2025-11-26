# OAuth Debugging Guide - INVALID_CLIENT Error

## Error Details

**Error:** `INVALID_CLIENT: Invalid client`
**Source:** Spotify OAuth
**When:** During login redirect

---

## Root Cause Analysis

The `INVALID_CLIENT` error in Spotify OAuth (PKCE flow) means one of the following:

### 1. **Client ID Mismatch** (Most Common)
The `SPOTIFY_CLIENT_ID` in your Vercel environment variables doesn't match your Spotify Developer Dashboard app.

### 2. **Wrong Spotify App Type**
The Spotify app might not have the correct settings enabled.

### 3. **Redirect URI Mismatch**
The redirect URI configured doesn't match what's registered in Spotify Dashboard.

---

## Step-by-Step Fix

### ✅ Step 1: Verify Spotify Client ID

1. Go to: https://developer.spotify.com/dashboard
2. Select your SonoLens app
3. Copy the **Client ID** (should be: `223858754ec542f18c9494cb3ced216b`)

### ✅ Step 2: Verify Vercel Environment Variables

1. Go to: https://vercel.com/
2. Select project: **sono-lens**
3. Go to: **Settings → Environment Variables**
4. Check **PRODUCTION** environment:
   - Variable name: `SPOTIFY_CLIENT_ID`
   - Value: `223858754ec542f18c9494cb3ced216b`

**CRITICAL:** Make sure there are:
- ✅ No extra spaces before or after the value
- ✅ No quotes around the value
- ✅ Exact match with Spotify Dashboard Client ID

### ✅ Step 3: Verify Redirect URIs in Spotify Dashboard

1. In Spotify Dashboard → Your App → **Edit Settings**
2. Under "Redirect URIs", verify you have:
   ```
   https://sono-lens.vercel.app/auth/callback
   ```
3. **IMPORTANT:**
   - Must be `https://` (not `http://`)
   - Must have `/auth/callback` path
   - No trailing slash
   - Exact match with production URL

### ✅ Step 4: Check Vercel SPOTIFY_REDIRECT_URI Variable

In Vercel environment variables, verify:
- Variable name: `SPOTIFY_REDIRECT_URI`
- Value: `https://sono-lens.vercel.app/auth/callback`

Must **exactly match** what's in Spotify Dashboard.

### ✅ Step 5: Re-deploy After Changes

If you made any changes to environment variables:

1. Go to Vercel Dashboard → Deployments
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete
5. Test again

---

## Debugging Commands

### Check Current Environment Variables in Vercel

Run locally to see what Vercel has configured:

```bash
npx vercel env pull .env.production
cat .env.production
```

This will show you the actual values Vercel is using.

### Test OAuth URL Manually

1. Visit production site: https://sono-lens.vercel.app
2. Open browser DevTools → Network tab
3. Click "Login with Spotify"
4. Look at the redirect URL in Network tab

It should look like:
```
https://accounts.spotify.com/authorize?
  client_id=223858754ec542f18c9494cb3ced216b
  &response_type=code
  &redirect_uri=https://sono-lens.vercel.app/auth/callback
  &code_challenge_method=S256
  &code_challenge=...
  &scope=...
```

**Check:**
- Is `client_id` correct?
- Is `redirect_uri` correct and matches Spotify Dashboard?

---

## Common Mistakes

### ❌ Mistake 1: Environment Variable Not Set for Production

**Problem:** Variable is set for "Preview" but not "Production"

**Fix:**
1. Vercel → Settings → Environment Variables
2. Make sure **Production** checkbox is checked
3. Redeploy

### ❌ Mistake 2: Extra Spaces in Client ID

**Problem:** Copy-paste added spaces

**Fix:**
```
Wrong: " 223858754ec542f18c9494cb3ced216b"
Right: "223858754ec542f18c9494cb3ced216b"
```

### ❌ Mistake 3: Wrong Redirect URI Protocol

**Problem:** Using `http://` instead of `https://`

**Fix:**
```
Wrong: http://sono-lens.vercel.app/auth/callback
Right: https://sono-lens.vercel.app/auth/callback
```

### ❌ Mistake 4: Client Secret Set (PKCE Doesn't Use It)

**Problem:** Added `SPOTIFY_CLIENT_SECRET` environment variable

**Fix:** PKCE flow does NOT use client secret. Remove it if present.

---

## Verification Checklist

Before testing again, verify:

- [ ] Client ID in Vercel exactly matches Spotify Dashboard
- [ ] Redirect URI in Vercel exactly matches Spotify Dashboard
- [ ] Redirect URI uses `https://` protocol
- [ ] No `SPOTIFY_CLIENT_SECRET` variable (PKCE doesn't use it)
- [ ] Environment variables set for **Production** environment
- [ ] Re-deployed after making changes
- [ ] Waited 1-2 minutes for deployment to complete

---

## Quick Fix Script

If you want to verify your Spotify app settings:

```bash
# Check your current Spotify Client ID from deployment credentials
cat .env.deployment | grep SPOTIFY_CLIENT_ID

# Expected output:
# SPOTIFY_CLIENT_ID=223858754ec542f18c9494cb3ced216b
```

Compare this with what's in Vercel Dashboard.

---

## Next Steps

After fixing the issue:

1. **Test on production:** https://sono-lens.vercel.app
2. **Expected flow:**
   - Click "Login with Spotify"
   - Redirects to Spotify authorization page
   - Shows: "SonoLens wants to access your Spotify account"
   - Click "Agree"
   - Redirects back to: https://sono-lens.vercel.app/dashboard
   - Shows your Spotify profile

3. **If still failing:**
   - Check Vercel Function Logs (Dashboard → Deployments → Function Logs)
   - Look for error details in server logs
   - Share the specific error message for further debugging

---

## Contact Support

If none of these fixes work:

1. **Check Spotify API Status:** https://status.spotify.com/
2. **Spotify Developer Forums:** https://community.spotify.com/
3. **Verify your Spotify app is approved** (some features require approval)

---

**Last Updated:** 2025-11-26
