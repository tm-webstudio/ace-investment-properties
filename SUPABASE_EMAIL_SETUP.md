# Supabase Email Configuration

## Overview
We've replaced Supabase's default email sending with Resend + React Email templates for a better branded experience.

## Setup Instructions

### Step 1: Disable Supabase Default Emails

**IMPORTANT:** You must disable Supabase's built-in email templates to prevent duplicate emails.

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **Email Templates**
3. **Disable** the following templates:
   - ✗ **Confirm signup** - We send via `/emails/EmailConfirmation.jsx`
   - ✗ **Magic Link** - We send via `/emails/MagicLink.jsx`
   - ✗ **Change Email Address** - We send via `/emails/EmailChange.jsx`
   - ✗ **Reset Password** - We send via `/emails/PasswordReset.jsx`

### Step 2: Verify Environment Variables

Ensure these environment variables are set in `.env.local` and Vercel:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 3: Verify Email Templates

All email templates are in `/emails` folder:

- ✅ `EmailConfirmation.jsx` - Email verification
- ✅ `Welcome.jsx` - Welcome email after signup
- ✅ `PasswordReset.jsx` - Password reset email
- ✅ `MagicLink.jsx` - Magic link login
- ✅ `EmailChange.jsx` - Email change confirmation

### Step 4: Test Email Flows

Test each auth flow to ensure emails are sent:

**Sign Up:**
```bash
# Should send 2 emails:
# 1. EmailConfirmation.jsx
# 2. Welcome.jsx
```

**Password Reset:**
```bash
# Should send:
# 1. PasswordReset.jsx
```

**Email Verification (resend):**
```bash
# Should send:
# 1. EmailConfirmation.jsx
```

## How It Works

### Auth Helper Functions

All auth operations now use helper functions from `/lib/authHelpers.js`:

1. **signUpWithEmail()** - Handles signup + sends welcome & confirmation emails
2. **sendPasswordReset()** - Sends password reset email
3. **sendMagicLink()** - Sends magic link login email
4. **sendEmailChange()** - Sends email change confirmation
5. **resendEmailVerification()** - Resends email verification

### Updated Routes

These routes now use the new auth helpers:

- ✅ `/app/api/auth/signup/route.ts` - Uses `signUpWithEmail()`
- ✅ `/app/api/auth/send-verification/route.ts` - Uses `resendEmailVerification()`

### Error Handling

- **Auth operations fail** if Supabase auth fails
- **Email failures are logged** but don't fail the auth operation
- Users can still sign up/login even if email sending fails
- Failed emails are logged to console for debugging

## Email Sending Flow

```
User Signs Up
    ↓
Supabase creates auth user
    ↓
signUpWithEmail() helper called
    ↓
Sends EmailConfirmation.jsx via Resend
    ↓
Sends Welcome.jsx via Resend
    ↓
Returns success to user
```

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is configured in Resend dashboard
3. Check console logs for error messages
4. Ensure email templates are in `/emails` folder

### Duplicate Emails

If users receive duplicate emails:
- Verify Supabase email templates are disabled
- Check auth routes aren't calling both Supabase AND helper functions

### Email Not Delivered

1. Check spam folder
2. Verify sender domain in Resend
3. Check Resend logs for delivery status
4. Verify recipient email is valid

## Development vs Production

### Development
- Uses `noreply@aceinvestmentproperties.co.uk` as sender
- Emails go to actual recipient addresses
- Console logs show email send status

### Production
- Same sender email
- All emails sent via Resend
- Monitor Resend dashboard for delivery rates

## Custom Email Templates

To customize email templates:

1. Edit files in `/emails` folder
2. All templates use React Email components
3. Maintain consistent branding:
   - Dark navy header (#1a1a2e)
   - Green primary buttons (#10b981)
   - Playfair Display + Inter fonts
   - Square corners (border-radius: 0)

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify environment variables
3. Test with a different email address
4. Check Resend dashboard for email status
