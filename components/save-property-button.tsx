"use client"

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
// Simple toast implementation - replace with your preferred toast library
const toast = {
  success: (message: string) => {
    // You can replace this with your preferred toast notification
    console.log('✅', message)
    // For now, we'll just show a temporary notification
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div')
      notification.textContent = message
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    }
  },
  error: (message: string) => {
    console.log('❌', message)
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div')
      notification.textContent = message
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    }
  }
}

interface SavePropertyButtonProps {
  propertyId: string
  initialSaved?: boolean
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  onSaveChange?: (isSaved: boolean) => void
}

export function SavePropertyButton({
  propertyId,
  initialSaved = false,
  size = 'medium',
  showLabel = false,
  className,
  variant = 'ghost',
  onSaveChange
}: SavePropertyButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingInitialState, setIsCheckingInitialState] = useState(false)
  const [cachedToken, setCachedToken] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  // Size configurations
  const sizeConfig = {
    small: {
      icon: 'h-4 w-4',
      button: 'h-8 px-2',
      text: 'text-xs'
    },
    medium: {
      icon: 'h-5 w-5',
      button: 'h-10 px-3',
      text: 'text-sm'
    },
    large: {
      icon: 'h-6 w-6',
      button: 'h-12 px-4',
      text: 'text-base'
    }
  }

  const config = sizeConfig[size]

  // Check initial saved state when component mounts (if user is authenticated)
  useEffect(() => {
    if (user && !initialSaved) {
      checkSavedState()
    }
  }, [user, propertyId, initialSaved])

  const checkSavedState = async () => {
    if (!user) return

    setIsCheckingInitialState(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        setIsCheckingInitialState(false)
        return
      }

      const response = await fetch(`/api/properties/${propertyId}/is-saved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => {
        // Silently fail on network errors (e.g., ad blockers, extensions)
        console.warn('Network error checking saved state:', err)
        return null
      })

      if (response && response.ok) {
        const data = await response.json()
        setIsSaved(data.isSaved)
        onSaveChange?.(data.isSaved)
      }
    } catch (error) {
      // Silently handle errors - the button will default to unsaved state
      console.warn('Error checking saved state:', error)
    } finally {
      setIsCheckingInitialState(false)
    }
  }

  const getAccessToken = async () => {
    // Try cached token first (but validate it's still good)
    if (cachedToken) {
      // Quick validation - if the user object exists, the cached token should be good
      if (user) return cachedToken
      // If no user but we have cached token, it's probably expired
      setCachedToken(null)
    }
    
    // Try localStorage
    const localToken = localStorage.getItem('accessToken')
    if (localToken && user) {
      setCachedToken(localToken)
      return localToken
    }
    
    // Try session as last resort
    if (user) {
      const { data: { session } } = await supabase.auth.getSession()
      const sessionToken = session?.access_token
      if (sessionToken) {
        setCachedToken(sessionToken)
        // Also update localStorage for next time
        localStorage.setItem('accessToken', sessionToken)
        return sessionToken
      }
    }
    
    // Clear any stale tokens
    setCachedToken(null)
    localStorage.removeItem('accessToken')
    return null
  }

  const handleSaveToggle = async (e?: React.MouseEvent) => {
    // Prevent event bubbling if this button is inside a clickable card
    e?.preventDefault()
    e?.stopPropagation()

    // Prevent rapid clicking
    if (isLoading) return

    // Check authentication
    if (!user) {
      toast.error('Please sign in to save properties')
      router.push('/auth/signin')
      return
    }

    const newSavedState = !isSaved
    
    // Immediate optimistic update for instant UI feedback
    setIsSaved(newSavedState)
    onSaveChange?.(newSavedState)
    setIsLoading(true)

    // Get token (using cached version for speed)
    const token = await getAccessToken()

    if (!token) {
      // Revert optimistic update
      setIsSaved(!newSavedState)
      onSaveChange?.(!newSavedState)
      setIsLoading(false)
      toast.error('Please sign in to save properties')
      router.push('/auth/signin')
      return
    }

    try {
      let response
      if (newSavedState) {
        // Save property
        response = await fetch(`/api/properties/${propertyId}/save`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } else {
        // Unsave property
        response = await fetch(`/api/properties/${propertyId}/unsave`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }

      const data = await response.json()

      if (!response.ok) {
        // If token is invalid, try to get a fresh token and retry once
        if (response.status === 401 && (data.error?.includes('Invalid or expired token') || data.error?.includes('Authentication required'))) {
          console.log('Token expired, refreshing and retrying...')
          setCachedToken(null)
          localStorage.removeItem('accessToken')
          
          const newToken = await getAccessToken()
          if (newToken) {
            // Retry the request with fresh token
            if (newSavedState) {
              response = await fetch(`/api/properties/${propertyId}/save`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                }
              })
            } else {
              response = await fetch(`/api/properties/${propertyId}/unsave`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${newToken}`
                }
              })
            }
            
            const retryData = await response.json()
            if (!response.ok) {
              throw new Error(retryData.error || `Failed to ${newSavedState ? 'save' : 'unsave'} property`)
            }
          } else {
            throw new Error('Authentication required')
          }
        } else {
          throw new Error(data.error || `Failed to ${newSavedState ? 'save' : 'unsave'} property`)
        }
      }

      // Show immediate success message
      if (newSavedState) {
        toast.success('Saved!')
      } else {
        toast.success('Removed!')
      }

    } catch (error: any) {
      console.error('Error toggling save state:', error)
      
      // Revert optimistic update on error
      setIsSaved(!newSavedState)
      onSaveChange?.(!newSavedState)
      
      // Handle specific error messages
      if (error.message.includes('Invalid or expired token') || error.message.includes('Authentication required')) {
        // Clear cached token and try to refresh
        setCachedToken(null)
        localStorage.removeItem('accessToken')
        toast.error('Please sign in again')
        router.push('/auth/signin')
      } else if (error.message.includes('investors only')) {
        toast.error('This feature is for investors only')
      } else {
        toast.error('Failed to update. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state for initial check
  if (isCheckingInitialState) {
    return (
      <Button
        variant={variant}
        size="sm"
        className={cn(config.button, 'opacity-50 cursor-not-allowed', className)}
        disabled
      >
        <Heart className={cn(config.icon, 'animate-pulse')} />
        {showLabel && <span className={cn('ml-2', config.text)}>Loading...</span>}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleSaveToggle}
      disabled={isLoading}
      className={cn(
        config.button,
        'transition-all duration-150 hover:scale-105',
        isSaved && 'text-red-500 hover:text-red-600',
        className
      )}
      title={isSaved ? 'Remove from saved' : 'Save property'}
    >
      <Heart 
        className={cn(
          config.icon,
          'transition-all duration-150',
          isSaved ? 'fill-current' : 'stroke-current'
        )} 
      />
      {showLabel && (
        <span className={cn('ml-2', config.text)}>
          {isLoading 
            ? (isSaved ? 'Removing...' : 'Saving...') 
            : (isSaved ? 'Saved' : 'Save Property')
          }
        </span>
      )}
    </Button>
  )
}