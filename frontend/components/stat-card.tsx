import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
        <div className="rounded-full bg-blue-50 p-3">
          {/* TODO: Replace with appropriate icon */}
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    </div>
  )
}
