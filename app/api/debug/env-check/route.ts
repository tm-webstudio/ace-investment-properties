import { NextResponse } from 'next/server'

export async function GET() {
  // This endpoint checks if required environment variables are present
  // DO NOT expose actual values, only check presence

  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Show first few characters to verify it's the right key (if it exists)
    SERVICE_ROLE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...'
      : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    SITE_URL: process.env.SITE_URL || 'NOT_SET',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET',
    RESEND_API_KEY: !!process.env.RESEND_API_KEY
  }

  return NextResponse.json(envCheck)
}
