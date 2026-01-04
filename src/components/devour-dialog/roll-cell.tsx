import { cn } from '@/lib/utils'

interface RollCellProps {
  result: number
}

export function RollCell({ result }: RollCellProps) {
  const isHunger = result === 1
  const isSuccess = result >= 4

  return (
    <div
      className={cn(
        "aspect-square flex items-center justify-center rounded-md border-2 text-xl font-rajdhani font-bold",
        isHunger ? "border-destructive bg-destructive/10 text-destructive" :
        isSuccess ? "border-green-500 bg-green-500/10 text-green-500" :
        "border-muted bg-muted/30 text-muted-foreground"
      )}
    >
      {isHunger ? '⚡' : result}
    </div>
  )
}
