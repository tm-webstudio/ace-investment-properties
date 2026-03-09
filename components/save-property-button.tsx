"use client"

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
// Simple toast implementation - replace with your preferred toast library
const toast = {
  success: (message: string) => {
    console.log('✅', message)
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
  size?: 'small' | 'medium' | 'large' | 'icon'
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
  const { user } = useAuth()

  // Sync with parent prop when it changes
  useEffect(() => {
    setIsSaved(initialSaved)
  }, [initialSaved])

  // Size configurations
  const sizeConfig = {
    icon: {
      icon: 'h-4 w-4',
      button: 'h-9 w-9 p-0',
      text: 'text-xs'
    },
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

  const handleSaveToggle = async (e?: React.MouseEvent) => {
    // Prevent event bubbling if this button is inside a clickable card
    e?.preventDefault()
    e?.stopPropagation()

    // Prevent rapid clicking
    if (isLoading) return

    // Check authentication
    if (!user) {
      toast.error('Please sign in to save properties')
      window.location.href = '/auth/signin'
      return
    }

    const newSavedState = !isSaved

    // Immediate optimistic update for instant UI feedback
    setIsSaved(newSavedState)
    onSaveChange?.(newSavedState)
    setIsLoading(true)

    const token = localStorage.getItem('accessToken')

    if (!token) {
      // Revert optimistic update
      setIsSaved(!newSavedState)
      onSaveChange?.(!newSavedState)
      setIsLoading(false)
      toast.error('Please sign in to save properties')
      window.location.href = '/auth/signin'
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
        if (response.status === 401) {
          localStorage.removeItem('accessToken')
          toast.error('Please sign in again')
          window.location.href = '/auth/signin'
          throw new Error('Authentication required')
        }
        throw new Error(data.error || `Failed to ${newSavedState ? 'save' : 'unsave'} property`)
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

      if (error.message.includes('investors only')) {
        toast.error('This feature is for investors only')
      } else if (!error.message.includes('Authentication required')) {
        toast.error('Failed to update. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Determine button size - use 'icon' for shadcn Button when our size is 'icon'
  const buttonSize = size === 'icon' ? 'icon' : 'sm'

  return (
    <Button
      variant={variant}
      size={buttonSize as any}
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
