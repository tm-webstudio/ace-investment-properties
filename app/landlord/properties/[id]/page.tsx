"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

interface LandlordPropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function LandlordPropertyPage({ params }: LandlordPropertyPageProps) {
  const router = useRouter()
  const urlParams = useParams()
  const id = urlParams.id as string

  useEffect(() => {
    // Redirect to the public property view page
    router.push(`/properties/${id}`)
  }, [id, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to property details...</p>
    </div>
  )
}