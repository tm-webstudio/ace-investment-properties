import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PropertyTitle } from "@/components/property-title"
import { FileText } from "lucide-react"

interface PropertySummary {
  propertyId: string
  name: string
  address: string
  city?: string
  postcode?: string
  image: string
  completedDocs: number
  totalDocs: number
}

interface PropertyDocumentsCardProps {
  property: PropertySummary
  onViewDocuments: (property: PropertySummary) => void
}

export function PropertyDocumentsCard({ property, onViewDocuments }: PropertyDocumentsCardProps) {
  const percentage = (property.completedDocs / property.totalDocs) * 100

  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={property.image}
          alt={property.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-[15px] mb-1 line-clamp-1">
            <PropertyTitle
              address={property.address}
              city={property.city}
              postcode={property.postcode}
            />
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            <PropertyTitle
              address={property.address}
              city={property.city}
              postcode={property.postcode}
              variant="full"
            />
          </p>
        </div>

        <div className="flex items-end gap-3 sm:gap-6">
          <div className="flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-0 text-sm">
              <span className="text-muted-foreground">Documents:</span>
              <span className="font-semibold">{property.completedDocs}/{property.totalDocs} Complete</span>
            </div>
            <div className="relative">
              <Progress value={percentage} className="h-2" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          <Button
            onClick={() => onViewDocuments(property)}
            variant="outline"
            size="sm"
            className="min-w-[120px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
