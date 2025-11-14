"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // First check for stored access token from our auth flow
        const accessToken = localStorage.getItem('accessToken')

        if (accessToken) {
          console.log('Auth context: Found access token, verifying with Supabase')

          // Verify the stored token
          const { data: { user }, error } = await supabase.auth.getUser(accessToken)

          if (user && !error) {
            console.log('Auth context: Token is valid, user authenticated:', user.id)
            setUser(user)
            setLoading(false)
            return
          } else {
            console.log('Auth context: Stored token is invalid, clearing localStorage')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }

        // Fallback to regular session check
        const { data: { session }, error } = await supabase.auth.getSession()

        // If there's a refresh token error, clear the session
        if (error && error.message.includes('refresh_token_not_found')) {
          console.log('Auth context: Invalid refresh token, clearing session')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          await supabase.auth.signOut()
          setUser(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Auth context: Error getting session:', error)
        // Clear potentially corrupted session data
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        await supabase.auth.signOut()
        setUser(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle sign out or token refresh errors
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }

        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    // Clear localStorage tokens
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Update local state
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}