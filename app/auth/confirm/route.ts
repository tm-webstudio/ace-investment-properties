import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  console.log('[CONFIRM] ===== EMAIL CONFIRM ROUTE =====')
  console.log('[CONFIRM] Full URL:', requestUrl.toString())
  console.log('[CONFIRM] Token hash:', token_hash ? token_hash.substring(0, 20) + '...' : 'none')
  console.log('[CONFIRM] Type:', type)
  console.log('[CONFIRM] Next:', next)

  if (token_hash && type) {
    console.log('[CONFIRM] Verifying OTP...')
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (error) {
      console.error('[CONFIRM] ❌ Verification failed:', error)
    }

    if (!error && data.user) {
      console.log('[CONFIRM] ✅ Email verified for user:', data.user.id)
      console.log('[CONFIRM] User type:', data.user.user_metadata?.user_type)
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
  return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', requestUrl.origin))
}
