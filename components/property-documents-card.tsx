import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText } from "lucide-react"

interface PropertySummary {
  propertyId: string
  name: string
  address: string
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
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{property.address}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Documents:</span>
            <span className="font-medium">{property.completedDocs}/{property.totalDocs} Complete</span>
          </div>
          <div className="relative">
            <Progress value={percentage} className="h-2" />
            <div
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}%</p>
        </div>

        <Button
          onClick={() => onViewDocuments(property)}
          className="w-full"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Documents
        </Button>
      </CardContent>
    </Card>
  )
}
