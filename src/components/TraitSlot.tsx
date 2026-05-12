import { Bystander } from '@/lib/Bystander'
import { Button } from '@/components/ui/button'
import { Trait } from "@/lib/Trait"
import { cn } from '@/lib/utils'
import { Edit, Trash2, User, Zap } from 'lucide-react'

interface TraitSlotProps {
  trait: Trait | Bystander | null
  onEdit: () => void
  onDelete?: () => void
  className?: string
  emptyText?: string
  icon?: 'lightning' | 'user'
}

export function TraitSlot({ trait, onEdit, onDelete, className, emptyText = 'Add Trait', icon = 'lightning' }: TraitSlotProps) {
  const EmptyIcon = icon === 'user' ? User : Zap
  const FilledIcon = icon === 'user' ? User : Zap
  
  if (!trait) {
    return (
      <button
        onClick={onEdit}
        className={cn(
          'group relative min-h-24 p-3 rounded border-2 border-dashed border-border bg-muted/20',
          'hover:border-accent/50 hover:bg-muted/40 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          className
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-accent transition-colors">
          <EmptyIcon className="w-5 h-5" />
          <span className="text-xs font-medium uppercase tracking-wide">{emptyText}</span>
        </div>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'group relative min-h-24 p-3 rounded border-2 border-border bg-card/50',
        'hover:border-accent/30 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <FilledIcon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <h3 className="font-rajdhani font-semibold text-sm uppercase tracking-tight text-accent flex-1 leading-tight">
          {trait.title}
        </h3>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed pl-6">{trait.description}</p>
      
      <div className="absolute top-2 right-2 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={onEdit}
        >
          <Edit className="w-3 h-3" />
        </Button>
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
