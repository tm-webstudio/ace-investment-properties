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
const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk';
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
      email_confirm: true, // Auto-confirm email to prevent Supabase from sending default confirmation
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

    // Step 2: Send email confirmation email using our template
    try {
      console.log('📧 [AUTH] Sending EmailConfirmation to:', email);
      const confirmationUrl = `${getSiteUrl()}/auth/confirm?token=${data.session?.access_token || 'pending'}`;

      await sendEmail({
        to: email,
        subject: 'Confirm your email address - Ace Investment Properties',
        react: EmailConfirmation({
          email,
          confirmationLink: confirmationUrl,
        })
      });

      console.log('✅ [AUTH] EmailConfirmation sent successfully to:', email);
    } catch (emailError) {
      // Don't fail auth if email fails
      console.error('❌ [AUTH] EmailConfirmation send failed (non-fatal):', emailError);
    }

    // Step 3: Send welcome email using our template
    try {
      console.log('📧 [AUTH] Sending Welcome email to:', email);
      const siteUrl = getSiteUrl();
      const dashboardLink = `${siteUrl}/${userType.toLowerCase()}/dashboard`;
      const profileLink = `${siteUrl}/${userType.toLowerCase()}/profile`;

      await sendEmail({
        to: email,
        subject: `Welcome to Ace Investment Properties!`,
        react: Welcome({
          name: `${firstName} ${lastName}`,
          userType: userType,
          dashboardLink,
          profileLink,
          helpLink: `${siteUrl}/help`,
        })
      });

      console.log('✅ [AUTH] Welcome email sent successfully to:', email);
    } catch (emailError) {
      // Don't fail auth if email fails
      console.error('❌ [AUTH] Welcome email send failed (non-fatal):', emailError);
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

    // Step 2: Send password reset email using our template
    try {
      console.log('📧 [AUTH] Sending PasswordReset email to:', email);
      // Use the actual reset link generated by Supabase admin API
      const resetLink = data.properties?.action_link || `${siteUrl}/auth/reset-password`;

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

    // Step 2: Send magic link email using our template
    try {
      console.log('📧 [AUTH] Sending MagicLink email to:', email);
      // Use the actual magic link generated by Supabase admin API
      const magicLink = data.properties?.action_link || `${siteUrl}/auth/callback`;

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

    // Send email confirmation using our template
    try {
      console.log('📧 [AUTH] Resending EmailConfirmation to:', email);
      const confirmationUrl = `${getSiteUrl()}/auth/confirm`;

      await sendEmail({
        to: email,
        subject: 'Verify your email address - Ace Investment Properties',
        react: EmailConfirmation({
          email,
          confirmationLink: confirmationUrl,
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
