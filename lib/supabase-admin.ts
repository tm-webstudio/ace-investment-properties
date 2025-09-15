import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * Secure operations that validate user permissions before database operations
 * This ensures data security without relying on RLS policies
 */

export async function secureCreateProperty(propertyData: any, userId: string, userType: string) {
  // Validate user is landlord or admin
  if (userType !== 'landlord' && userType !== 'admin') {
    throw new Error('Unauthorized: Only landlords can create properties')
  }

  // Ensure the property is associated with the authenticated user
  const securePropertyData = {
    ...propertyData,
    landlord_id: userId // Force landlord_id to be the authenticated user
  }

  // Create property with validated data
  const { data, error } = await supabase
    .from('properties')
    .insert(securePropertyData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function secureCreateDraft(draftData: any, userId: string | null) {
  // For authenticated users, force user_id
  if (userId) {
    const secureDraftData = {
      ...draftData,
      user_id: userId,
      session_id: null // Clear session_id for authenticated users
    }

    const { data, error } = await supabase
      .from('property_drafts')
      .insert(secureDraftData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } else {
    // For anonymous users, ensure they have a session_id and no user_id
    const secureDraftData = {
      ...draftData,
      user_id: null,
      session_id: draftData.session_id
    }

    if (!secureDraftData.session_id) {
      throw new Error('Session ID required for anonymous users')
    }

    const { data, error } = await supabase
      .from('property_drafts')
      .insert(secureDraftData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }
}

export async function secureUpdateDraft(draftId: string, draftData: any, userId: string | null, sessionId: string | null) {
  let query = supabase.from('property_drafts').select('*').eq('id', draftId)
  
  // First, verify the user has permission to update this draft
  if (userId) {
    query = query.eq('user_id', userId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId).is('user_id', null)
  } else {
    throw new Error('User ID or Session ID required')
  }

  const { data: existingDraft, error: fetchError } = await query.single()
  
  if (fetchError || !existingDraft) {
    throw new Error('Draft not found or access denied')
  }

  // Update the draft
  const { data, error } = await supabase
    .from('property_drafts')
    .update(draftData)
    .eq('id', draftId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function secureGetUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}