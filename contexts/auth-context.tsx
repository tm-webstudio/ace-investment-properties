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
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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