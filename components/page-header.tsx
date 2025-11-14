import { Card, CardHeader } from "@/components/ui/card"

interface PageHeaderProps {
  title: string
  subtitle: string
  category?: string
  variant?: 'default' | 'blue' | 'green' | 'red' | 'primary'
  className?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  category, 
  variant = 'default',
  className = "" 
}: PageHeaderProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return {
          background: "bg-gradient-to-r from-blue-50/50 via-blue-50/30 to-blue-100/50 border-blue-200/30",
          category: "text-blue-600/70",
          title: "text-blue-900",
          subtitle: "text-blue-800/70"
        }
      case 'green':
        return {
          background: "bg-gradient-to-r from-green-50/50 via-green-50/30 to-green-100/50 border-green-200/30",
          category: "text-green-600/70",
          title: "text-green-900",
          subtitle: "text-green-800/70"
        }
      case 'red':
        return {
          background: "bg-gradient-to-r from-red-50/50 via-red-50/30 to-red-100/50 border-red-200/30",
          category: "text-red-600/70",
          title: "text-red-900",
          subtitle: "text-red-800/70"
        }
      case 'primary':
        return {
          background: "bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5 border-primary/10",
          category: "text-primary/70",
          title: "text-primary",
          subtitle: "text-primary/70"
        }
      default:
        return {
          background: "bg-gradient-to-r from-muted/30 via-muted/20 to-muted/40 border-muted/20",
          category: "text-muted-foreground",
          title: "text-foreground",
          subtitle: "text-muted-foreground"
        }
    }
  }

  const variantClasses = getVariantClasses()

  return (
    <Card className={`mb-8 ${variantClasses.background} ${className}`}>
      <CardHeader className="pb-4 pt-4">
        {category && (
          <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${variantClasses.category}`}>
            {category}
          </p>
        )}
        <h1 className={`font-serif text-3xl md:text-4xl font-bold mb-1 ${variantClasses.title}`}>
          {title}
        </h1>
        <p className={`text-md ${variantClasses.subtitle}`}>
          {subtitle}
        </p>
      </CardHeader>
    </Card>
  )
}