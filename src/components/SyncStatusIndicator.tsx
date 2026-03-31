import { SyncStatus } from '@/hooks/useCloudSync'
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react'

interface SyncStatusIndicatorProps {
  status: SyncStatus
}

const config: Record<SyncStatus, { icon: React.ReactNode; label: string; className: string }> = {
  idle: { icon: null, label: '', className: '' },
  syncing: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: 'Syncing…',
    className: 'text-muted-foreground',
  },
  synced: {
    icon: <Check className="w-4 h-4" />,
    label: 'Synced',
    className: 'text-green-500',
  },
  offline: {
    icon: <CloudOff className="w-4 h-4" />,
    label: 'Offline',
    className: 'text-yellow-500',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Sync error',
    className: 'text-destructive',
  },
  conflict: {
    icon: <Cloud className="w-4 h-4" />,
    label: 'Resolve sync conflict',
    className: 'text-amber-500',
  },
}

export function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
  if (status === 'idle') return null

  const { icon, label, className } = config[status]

  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${className}`}
      title={label}
      role="status"
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}
