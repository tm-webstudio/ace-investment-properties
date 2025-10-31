# Deployment Guide

## Required Environment Variables

For the application to work correctly in production, you **must** set the following environment variables:

### Public Variables (Client-side)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Private Variables (Server-side only - NEVER expose to client)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (required for admin operations)

## Where to Find These Values

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
3. You'll find:
   - **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → use for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Platform-Specific Instructions

### Vercel
1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add all three variables listed above
4. **Important:** After adding variables, you MUST redeploy
   - Go to **Deployments**
   - Click the three dots on the latest deployment
   - Select **Redeploy**
   - Make sure "Use existing build cache" is **unchecked**

### Netlify
1. Go to your site on Netlify
2. Navigate to **Site settings** → **Environment variables**
3. Add all three variables listed above
4. Trigger a new deployment

### Other Platforms
Consult your platform's documentation on how to set environment variables, then add the three required variables.

## Troubleshooting

### "Service temporarily unavailable" Error
This error occurs when `SUPABASE_SERVICE_ROLE_KEY` is missing or not properly set in production.

**Solution:**
1. Verify the environment variable is set in your deployment platform
2. Make sure you've redeployed after adding the variable
3. Try a fresh deployment (without cache)
4. Visit `/api/debug/env-check` on your production site to verify environment variables are loaded

### Verifying Environment Variables
You can verify your environment variables are properly set by visiting:
```
https://your-production-domain.com/api/debug/env-check
```

This will show which variables are present (without exposing their values).

**Important:** Remove this debug endpoint before going fully live, or restrict access to it.

## Security Notes

- **Never** commit `.env.local` or any file containing actual environment variable values
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secret
- Only set `SUPABASE_SERVICE_ROLE_KEY` as a server-side environment variable
- Rotate your keys if they are ever exposed
