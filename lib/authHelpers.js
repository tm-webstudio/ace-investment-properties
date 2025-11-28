/**
 * Auth Helper Functions
 *
 * Wrapper functions for Supabase authentication that send emails via Resend
 * using our existing React Email templates instead of Supabase's default emails.
 *
 * IMPORTANT: Disable Supabase's default email sending:
 * 1. Go to Supabase Dashboard → Authentication → Email Templates
 * 2. Turn OFF: 'Confirm email', 'Password recovery', 'Magic Link'
 * 3. We're handling all emails via Resend now with custom templates
 */

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './email';
import EmailConfirmation from '@/emails/EmailConfirmation';
import Welcome from '@/emails/Welcome';
import PasswordReset from '@/emails/PasswordReset';
import MagicLink from '@/emails/MagicLink';
import EmailChange from '@/emails/EmailChange';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get site URL with fallback
// Use SITE_URL for server-side, NEXT_PUBLIC_SITE_URL for client-side
const getSiteUrl = () => {
  const url = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk';
  console.log('[AUTH] getSiteUrl() returning:', url);
  return url;
};

/**
 * Sign up a new user with email/password and send welcome + confirmation emails
 *
 * @param {Object} params
 * @param {string} params.email - User's email address
 * @param {string} params.password - User's password
 * @param {string} params.firstName - User's first name
 * @param {string} params.lastName - User's last name
 * @param {string} params.userType - 'Investor' or 'Landlord'
 * @returns {Promise<{data, error}>}
 */
export async function signUpWithEmail({
  email,
  password,
  firstName,
  lastName,
  userType = 'Investor'
}) {
  try {
    console.log(`[AUTH] Signing up user: ${email} as ${userType}`);

    // Step 1: Create user with admin client to bypass Supabase's automatic confirmation email
    // We'll send our own confirmation email via Resend
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm - user must click the link in the email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        user_type: userType.toLowerCase(),
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (error) {
      console.error('[AUTH] Signup failed:', error);
      return { data: null, error };
    }

    console.log('[AUTH] Signup successful, user ID:', data.user?.id);

    // Step 2: Generate email confirmation link
    let confirmationUrl = `${getSiteUrl()}/auth/confirm`;

    try {
      // Generate confirmation link using admin API
      const siteUrl = getSiteUrl();
      console.log('[AUTH] ===== EMAIL CONFIRMATION LINK GENERATION =====');
      console.log('[AUTH] Site URL:', siteUrl);
      console.log('[AUTH] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        }
      });

      if (linkError) {
        console.error('[AUTH] ❌ Link generation error:', linkError);
      }

      if (linkData) {
        console.log('[AUTH] ✅ Link data received:');
        console.log('[AUTH]    - action_link:', linkData.properties?.action_link);
        console.log('[AUTH]    - hashed_token:', linkData.properties?.hashed_token?.substring(0, 20) + '...');
        console.log('[AUTH]    - verification_type:', linkData.properties?.verification_type);
      }

      if (!linkError && linkData?.properties?.action_link) {
        // Check if action_link contains 'undefined' (Supabase Site URL not configured)
        if (linkData.properties.action_link.includes('undefined')) {
          console.warn('[AUTH] ⚠️  action_link contains undefined, constructing manual URL');
          // Construct URL manually using hashed_token
          const token = linkData.properties.hashed_token;
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          confirmationUrl = `${supabaseUrl}/auth/v1/verify?token_hash=${token}&type=signup&redirect_to=${encodeURIComponent(siteUrl + '/auth/callback')}`;
          console.log('[AUTH] 🔧 Manually constructed URL:', confirmationUrl);
        } else {
          confirmationUrl = linkData.properties.action_link;
          console.log('[AUTH] ✅ Using Supabase action_link:', confirmationUrl);
        }
      } else {
        console.warn('[AUTH] ⚠️  Using fallback URL (no valid link data)');
      }

      console.log('[AUTH] 📧 Final confirmation URL to send:', confirmationUrl);
      console.log('[AUTH] ================================================');
    } catch (linkGenError) {
      console.error('[AUTH] ❌ Exception generating confirmation link:', linkGenError);
    }

    // Step 3: Send email confirmation email using our template
    try {
      console.log('📧 [AUTH] Sending EmailConfirmation to:', email);

      await sendEmail({
        to: email,
        subject: 'Confirm your email address - Ace Investment Properties',
        react: EmailConfirmation({
          email,
          confirmationUrl: confirmationUrl,
        })
      });

      console.log('✅ [AUTH] EmailConfirmation sent successfully to:', email);
    } catch (emailError) {
      // Don't fail auth if email fails
      console.error('❌ [AUTH] EmailConfirmation send failed (non-fatal):', emailError);
    }

    return { data, error: null };

  } catch (error) {
    console.error('[AUTH] Unexpected error in signUpWithEmail:', error);
    return { data: null, error };
  }
}

/**
 * Send a password reset email
 *
 * @param {string} email - User's email address
 * @returns {Promise<{data, error}>}
 */
export async function sendPasswordReset(email) {
  try {
    console.log(`[AUTH] Sending password reset to: ${email}`);

    const siteUrl = getSiteUrl();

    // Step 1: Generate password reset link using admin API (doesn't send Supabase email)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${siteUrl}/auth/reset-password`,
      }
    });

    if (error) {
      console.error('[AUTH] Password reset request failed:', error);
      return { data: null, error };
    }

    console.log('[AUTH] Password reset link data:', JSON.stringify(data, null, 2));

    // Step 2: Send password reset email using our template
    try {
      console.log('📧 [AUTH] Sending PasswordReset email to:', email);
      // Use the actual reset link generated by Supabase admin API
      let resetLink = data.properties?.action_link || `${siteUrl}/auth/reset-password`;

      // Check if action_link contains 'undefined' (Supabase Site URL not configured)
      if (resetLink.includes('undefined')) {
        console.warn('[AUTH] Reset link contains undefined, constructing manual URL');
        const token = data.properties.hashed_token;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        resetLink = `${supabaseUrl}/auth/v1/verify?token=${token}&type=recovery&redirect_to=${encodeURIComponent(siteUrl + '/auth/reset-password')}`;
      }

      console.log('[AUTH] Reset link:', resetLink);

      await sendEmail({
        to: email,
        subject: 'Reset your password - Ace Investment Properties',
        react: PasswordReset({
          email,
          resetLink,
        })
      });

      console.log('✅ [AUTH] PasswordReset email sent successfully to:', email);
    } catch (emailError) {
      // Don't fail reset if email fails
      console.error('❌ [AUTH] PasswordReset email send failed (non-fatal):', emailError);
    }

    return { data, error: null };

  } catch (error) {
    console.error('[AUTH] Unexpected error in sendPasswordReset:', error);
    return { data: null, error };
  }
}

/**
 * Send a magic link for passwordless login
 *
 * @param {string} email - User's email address
 * @returns {Promise<{data, error}>}
 */
export async function sendMagicLink(email) {
  try {
    console.log(`[AUTH] Sending magic link to: ${email}`);

    const siteUrl = getSiteUrl();

    // Step 1: Generate magic link using admin API (doesn't send Supabase email)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      }
    });

    if (error) {
      console.error('[AUTH] Magic link request failed:', error);
      return { data: null, error };
    }

    console.log('[AUTH] Magic link data:', JSON.stringify(data, null, 2));

    // Step 2: Send magic link email using our template
    try {
      console.log('📧 [AUTH] Sending MagicLink email to:', email);
      // Use the actual magic link generated by Supabase admin API
      let magicLink = data.properties?.action_link || `${siteUrl}/auth/callback`;

      // Check if action_link contains 'undefined' (Supabase Site URL not configured)
      if (magicLink.includes('undefined')) {
        console.warn('[AUTH] Magic link contains undefined, constructing manual URL');
        const token = data.properties.hashed_token;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        magicLink = `${supabaseUrl}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(siteUrl + '/auth/callback')}`;
      }

      console.log('[AUTH] Magic link URL:', magicLink);

      await sendEmail({
        to: email,
        subject: 'Your magic login link - Ace Investment Properties',
        react: MagicLink({
          email,
          magicLink,
        })
      });

      console.log('✅ [AUTH] MagicLink email sent successfully to:', email);
    } catch (emailError) {
      // Don't fail magic link if email fails
      console.error('❌ [AUTH] MagicLink email send failed (non-fatal):', emailError);
    }

    return { data, error: null };

  } catch (error) {
    console.error('[AUTH] Unexpected error in sendMagicLink:', error);
    return { data: null, error };
  }
}

/**
 * Send email change confirmation
 *
 * @param {Object} params
 * @param {string} params.userId - User's ID
 * @param {string} params.oldEmail - Current email address
 * @param {string} params.newEmail - New email address
 * @returns {Promise<{data, error}>}
 */
export async function sendEmailChange({ userId, oldEmail, newEmail }) {
  try {
    console.log(`[AUTH] Changing email for user ${userId}: ${oldEmail} → ${newEmail}`);

    // Step 1: Update email in Supabase
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email: newEmail,
    });

    if (error) {
      console.error('[AUTH] Email change failed:', error);
      return { data: null, error };
    }

    // Step 2: Send confirmation email to new address using our template
    try {
      console.log('📧 [AUTH] Sending EmailChange confirmation to:', newEmail);
      const confirmLink = `${getSiteUrl()}/auth/confirm-email-change`;

      await sendEmail({
        to: newEmail,
        subject: 'Confirm your new email address - Ace Investment Properties',
        react: EmailChange({
          oldEmail,
          newEmail,
          confirmLink,
        })
      });

      console.log('✅ [AUTH] EmailChange confirmation sent successfully to:', newEmail);
    } catch (emailError) {
      // Don't fail email change if confirmation email fails
      console.error('❌ [AUTH] EmailChange confirmation send failed (non-fatal):', emailError);
    }

    return { data, error: null };

  } catch (error) {
    console.error('[AUTH] Unexpected error in sendEmailChange:', error);
    return { data: null, error };
  }
}

/**
 * Resend email verification
 *
 * @param {string} email - User's email address
 * @returns {Promise<{data, error}>}
 */
export async function resendEmailVerification(email) {
  try {
    console.log(`[AUTH] Resending email verification to: ${email}`);

    const siteUrl = getSiteUrl();

    // Generate a fresh verification link using Supabase (avoids stale/blank URLs)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      }
    });

    if (linkError) {
      console.error('[AUTH] ❌ Link generation error (resend verification):', linkError);
      return { data: null, error: linkError };
    }

    let confirmationUrl = `${siteUrl}/auth/confirm`;

    if (linkData?.properties?.action_link) {
      if (linkData.properties.action_link.includes('undefined')) {
        console.warn('[AUTH] ⚠️  action_link contains undefined, constructing manual URL (resend)');
        const token = linkData.properties.hashed_token;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        confirmationUrl = `${supabaseUrl}/auth/v1/verify?token_hash=${token}&type=signup&redirect_to=${encodeURIComponent(siteUrl + '/auth/callback')}`;
      } else {
        confirmationUrl = linkData.properties.action_link;
      }
    }

    // Send email confirmation using our template
    try {
      console.log('📧 [AUTH] Resending EmailConfirmation to:', email);

      await sendEmail({
        to: email,
        subject: 'Verify your email address - Ace Investment Properties',
        react: EmailConfirmation({
          email,
          confirmationUrl: confirmationUrl,
        })
      });

      console.log('✅ [AUTH] EmailConfirmation resent successfully to:', email);
      return { data: { success: true }, error: null };
    } catch (emailError) {
      console.error('❌ [AUTH] EmailConfirmation resend failed:', emailError);
      return { data: null, error: emailError };
    }

  } catch (error) {
    console.error('[AUTH] Unexpected error in resendEmailVerification:', error);
    return { data: null, error };
  }
}

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Environment Variables Required:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 *    - RESEND_API_KEY
 *    - NEXT_PUBLIC_SITE_URL
 *
 * 2. Disable Supabase Default Emails:
 *    Go to: Supabase Dashboard → Authentication → Email Templates
 *    Turn OFF these templates (we handle them via Resend now):
 *    - ✗ Confirm signup
 *    - ✗ Magic Link
 *    - ✗ Change Email Address
 *    - ✗ Reset Password
 *
 * 3. Usage in API routes:
 *    ```javascript
 *    import { signUpWithEmail } from '@/lib/authHelpers';
 *
 *    const { data, error } = await signUpWithEmail({
 *      email,
 *      password,
 *      firstName,
 *      lastName,
 *      userType: 'Investor'
 *    });
 *    ```
 *
 * 4. Error Handling:
 *    - Auth operations fail if Supabase fails
 *    - Email failures are logged but don't fail the auth operation
 *    - Always check the error property in responses
 */
