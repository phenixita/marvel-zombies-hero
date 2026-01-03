import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface KeyboardShortcutsProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { key: 'Ctrl/Cmd + N', description: 'New Game' },
  { key: 'Ctrl/Cmd + K', description: 'Show Keyboard Shortcuts' },
  { key: 'Tab', description: 'Navigate between elements' },
  { key: 'Enter', description: 'Activate focused element' },
  { key: 'Escape', description: 'Close dialog / Cancel edit' },
  { key: 'Space', description: 'Toggle focused element' },
]

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick keyboard commands for efficient gameplay tracking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border border-border font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
