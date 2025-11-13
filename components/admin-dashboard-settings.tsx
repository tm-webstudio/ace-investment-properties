"use client"

import { Settings } from "lucide-react"

export function AdminDashboardSettings() {
  return (
    <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
      <Settings className="h-10 w-10 mx-auto mb-3 opacity-50" />
      <p className="text-base font-medium mb-1.5">No Settings</p>
      <p className="text-sm">Settings interface coming soon</p>
    </div>
  )
}
