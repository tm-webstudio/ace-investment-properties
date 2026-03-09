"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
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
  const userIdRef = useRef<string | null>(null)

  // Only update user state when the user ID actually changes,
  // preventing cascading re-renders from TOKEN_REFRESHED events
  const setUserIfChanged = (newUser: User | null) => {
    const newId = newUser?.id ?? null
    if (newId !== userIdRef.current) {
      userIdRef.current = newId
      setUser(newUser)
    }
  }

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
            setUserIfChanged(user)
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
          setUserIfChanged(null)
          setLoading(false)
          return
        }

        setUserIfChanged(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Auth context: Error getting session:', error)
        // Clear potentially corrupted session data
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        await supabase.auth.signOut()
        setUserIfChanged(null)
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

        setUserIfChanged(session?.user ?? null)
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
    userIdRef.current = null
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, signOut }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
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