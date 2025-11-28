import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import Welcome from '@/emails/Welcome'

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  console.log('[CALLBACK] ===== AUTH CALLBACK ROUTE =====')
  console.log('[CALLBACK] Full URL:', requestUrl.toString())
  console.log('[CALLBACK] Code:', code ? code.substring(0, 20) + '...' : 'none')
  console.log('[CALLBACK] Next:', next)

  if (code) {
    console.log('[CALLBACK] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[CALLBACK] ❌ Exchange failed:', error)
    }

    if (!error && data.user) {
      console.log('[CALLBACK] ✅ Session created for user:', data.user.id)
      console.log('[CALLBACK] User type:', data.user.user_metadata?.user_type)
      const userType = data.user.user_metadata?.user_type || 'investor'
      const dashboardUrl = new URL(`/${userType}/dashboard?verified=true`, requestUrl.origin)
      const accessToken = data.session?.access_token
      const refreshToken = data.session?.refresh_token
      const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

      // If welcome email hasn't been sent, send it now and mark metadata
      if (!data.user.user_metadata?.welcome_sent && supabaseAdmin) {
        try {
          const firstName = data.user.user_metadata?.first_name || ''
          const lastName = data.user.user_metadata?.last_name || ''
          const fullName = `${firstName} ${lastName}`.trim() || data.user.email || 'User'
          const dashboardLink = `${siteUrl}/${userType}/dashboard`
          const profileLink = `${siteUrl}/${userType}/profile`

          console.log('[CALLBACK] Sending welcome email post-verification')
          await sendEmail({
            to: data.user.email!,
            subject: 'Welcome to Ace Investment Properties!',
            react: Welcome({
              name: fullName,
              userType: userType.charAt(0).toUpperCase() + userType.slice(1),
              dashboardLink,
              profileLink,
              helpLink: `${siteUrl}/help`,
            })
          })

          // Mark welcome as sent in user metadata to prevent duplicates
          await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            user_metadata: {
              ...data.user.user_metadata,
              welcome_sent: true
            }
          })
        } catch (welcomeError) {
          console.error('[CALLBACK] Failed to send or mark welcome email:', welcomeError)
        }
      }

      // Build an inline page that persists tokens to localStorage (for client-side supabase) and redirects to dashboard
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta http-equiv="Cache-Control" content="no-store" />
          <title>Signing you in…</title>
        </head>
        <body>
          <p>Signing you in…</p>
          <script>
            (function() {
              try {
                ${accessToken ? `localStorage.setItem('accessToken', ${JSON.stringify(accessToken)});` : ''}
                ${refreshToken ? `localStorage.setItem('refreshToken', ${JSON.stringify(refreshToken)});` : ''}
              } catch (e) {
                console.warn('Auth callback: failed to write tokens to localStorage', e);
              }
              window.location.href = ${JSON.stringify(dashboardUrl.toString())};
            })();
          </script>
        </body>
        </html>
      `

      const response = new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store'
        }
      })

      // Also set session cookies for server-side routes if available
      if (data.session) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in
        })
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      }

      return response
    }
  }

  // Return error redirect
  return NextResponse.redirect(new URL('/auth/signin?error=auth_callback_error', requestUrl.origin))
}
