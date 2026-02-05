'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

export interface AddressData {
  fullAddress: string
  street: string
  city: string
  localAuthority: string
  postcode: string
  country: string
  latitude: number | null
  longitude: number | null
}

interface PropertyAddressInputProps {
  value: AddressData
  onChange: (data: AddressData) => void
  error?: string
}

interface Prediction {
  placePrediction: {
    placeId: string
    text: {
      text: string
    }
  }
}

export function PropertyAddressInput({ value, onChange, error }: PropertyAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputValue, setInputValue] = useState(value.street)
  const [hasSelected, setHasSelected] = useState(!!value.fullAddress)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Sync inputValue with value.street when it changes externally
  useEffect(() => {
    if (value.street !== inputValue && hasSelected) {
      setInputValue(value.street)
    }
  }, [value.street, hasSelected])

  // Fetch autocomplete predictions
  const fetchPredictions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    if (!apiKey) {
      setLoadError('Google Maps API key not configured')
      return
    }

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            input,
            includedRegionCodes: ['gb'],
            languageCode: 'en',
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch predictions')
      }

      const data = await response.json()
      setPredictions(data.suggestions || [])
      setShowDropdown(true)
    } catch (error) {
      console.error('Error fetching predictions:', error)
      setLoadError('Failed to load address suggestions')
    }
  }, [apiKey])

  // Fetch local authority from Postcodes.io
  const fetchLocalAuthority = async (postcode: string): Promise<string | null> => {
    try {
      // Remove spaces from postcode for API call
      const cleanedPostcode = postcode.replace(/\s+/g, '')

      if (!cleanedPostcode) {
        return null
      }

      const response = await fetch(
        `https://api.postcodes.io/postcodes/${cleanedPostcode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.log(`Postcodes.io returned status ${response.status} for postcode ${postcode}`)
        return null
      }

      const data = await response.json()

      // Extract admin_district from response
      const adminDistrict = data?.result?.admin_district

      if (adminDistrict && typeof adminDistrict === 'string') {
        return adminDistrict
      }

      return null
    } catch (error) {
      console.error('Error fetching local authority from Postcodes.io:', error)
      return null
    }
  }

  // Fetch place details
  const fetchPlaceDetails = async (placeId: string) => {
    if (!apiKey) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'id,formattedAddress,addressComponents,location',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch place details: ${response.status}`)
      }

      const place = await response.json()

      // Extract address components
      const addressComponents = place.addressComponents || []
      let street = ''
      let city = ''
      let localAuthority = ''
      let postcode = ''
      let country = 'United Kingdom'

      for (const component of addressComponents) {
        const types = component.types || []

        if (types.includes('street_number')) {
          street = component.longText + ' ' + street
        }

        if (types.includes('route')) {
          street = street + component.longText
        }

        if (types.includes('subpremise') || types.includes('premise')) {
          street = component.longText + ', ' + street
        }

        if (types.includes('postal_town') || types.includes('locality')) {
          city = component.longText
        }

        if (types.includes('administrative_area_level_2')) {
          localAuthority = component.longText
        }

        if (types.includes('postal_code')) {
          postcode = component.longText
        }

        if (types.includes('country')) {
          country = component.longText
        }
      }

      // Get coordinates
      const latitude = place.location?.latitude || null
      const longitude = place.location?.longitude || null

      // Fetch accurate local authority from Postcodes.io
      let finalLocalAuthority = localAuthority // Fallback to Google Places data

      if (postcode) {
        const postcodeAuthority = await fetchLocalAuthority(postcode)
        if (postcodeAuthority) {
          finalLocalAuthority = postcodeAuthority
          console.log('Local authority from Postcodes.io:', postcodeAuthority)
        } else {
          console.log('Using Google Places local authority as fallback:', localAuthority)
        }
      }

      // Update form data
      onChange({
        fullAddress: place.formattedAddress || '',
        street: street.trim(),
        city,
        localAuthority: finalLocalAuthority,
        postcode,
        country,
        latitude,
        longitude,
      })

      setInputValue(street.trim())
      setShowDropdown(false)
      setPredictions([])
      setHasSelected(true)
    } catch (error) {
      console.error('Error fetching place details:', error)
      setLoadError('Failed to load address details')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle manual field edits
  const handleFieldChange = (field: keyof AddressData, fieldValue: string | number | null) => {
    onChange({
      ...value,
      [field]: fieldValue
    })
  }

  // Clear selection
  const handleClear = () => {
    setInputValue('')
    setHasSelected(false)
    onChange({
      fullAddress: '',
      street: '',
      city: '',
      localAuthority: '',
      postcode: '',
      country: 'United Kingdom',
      latitude: null,
      longitude: null
    })
    setPredictions([])
    setShowDropdown(false)
  }

  // Handle prediction selection
  const handlePredictionClick = (e: React.MouseEvent, placeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    fetchPlaceDetails(placeId)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!apiKey) {
    return (
      <div>
        <Label htmlFor="address">Property Address *</Label>
        <Input
          id="address"
          defaultValue={value.fullAddress}
          placeholder="Start typing an address..."
          disabled
        />
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
            <p className="text-sm text-red-700">Google Maps API key not configured</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-center justify-between">
          <Label htmlFor="address">
            Street Address *
            {isLoading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          </Label>
          {hasSelected && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear & Search Again
            </button>
          )}
        </div>
        <Input
          id="address"
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value
            setInputValue(newValue)

            if (hasSelected) {
              // Update street field when editing after selection
              handleFieldChange('street', newValue)
            } else {
              // Clear previous timer
              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
              }
              // Set new timer for autocomplete
              debounceTimer.current = setTimeout(() => {
                fetchPredictions(newValue)
              }, 300)
            }
          }}
          placeholder="Start typing a UK address..."
          disabled={isLoading}
          autoComplete="off"
        />

        {/* Dropdown with predictions */}
        {showDropdown && predictions.length > 0 && !hasSelected && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {predictions.map((prediction) => (
              <button
                key={prediction.placePrediction.placeId}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 focus:outline-none border-b border-slate-100 last:border-b-0"
                onMouseDown={(e) => handlePredictionClick(e, prediction.placePrediction.placeId)}
              >
                {prediction.placePrediction.text.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editable address fields */}
      {hasSelected && value.fullAddress && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={value.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="localAuthority">Local Authority</Label>
              <Input
                id="localAuthority"
                value={value.localAuthority}
                onChange={(e) => handleFieldChange('localAuthority', e.target.value)}
                placeholder="e.g. Greater London, Manchester City Council"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="postcode">Postcode *</Label>
            <Input
              id="postcode"
              value={value.postcode}
              onChange={(e) => handleFieldChange('postcode', e.target.value.toUpperCase())}
              placeholder="e.g. SW1A 1AA"
              className="uppercase"
            />
          </div>
        </>
      )}

      {(error || loadError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
            <p className="text-sm text-red-700">{error || loadError}</p>
          </div>
        </div>
      )}
    </div>
  )
}
