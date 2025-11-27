import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

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
      const response = NextResponse.redirect(new URL(`/${userType}/dashboard?verified=true`, requestUrl.origin))

      // Set session cookies
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
