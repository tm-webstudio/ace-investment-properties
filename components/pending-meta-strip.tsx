import { Calendar, Users } from "lucide-react"

interface PendingMetaStripProps {
  landlordName?: string
  submittedDate?: string | null
  onClick?: () => void
}

export function PendingMetaStrip({ landlordName, submittedDate, onClick }: PendingMetaStripProps) {
  const iconColor = 'text-[#0b3b63]' // brand-aligned navy
  const content = (
    <div className="flex items-center justify-between gap-3 text-[12px] border border-border/50 bg-white text-foreground px-3 py-2 rounded-none transition-colors hover:border-accent/30 hover:bg-accent/5">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <Users className={`h-3.5 w-3.5 ${iconColor}`} />
        <span className="leading-tight">{landlordName || "Unknown"}</span>
      </div>
      <div className="flex items-center gap-2 text-foreground">
        <Calendar className={`h-3.5 w-3.5 ${iconColor}`} />
        <span className="leading-tight">
          {submittedDate ? new Date(submittedDate).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: '2-digit' }) : "N/A"}
        </span>
      </div>
    </div>
  )

  if (!onClick) return content

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  )
}
