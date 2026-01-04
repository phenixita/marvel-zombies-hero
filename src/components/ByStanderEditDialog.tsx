import { Trait } from "@/lib/Trait"
import { EntityEditDialog } from './EntityEditDialog'

interface ByStanderEditDialogProps {
  open: boolean
  onClose: () => void
  byStander: Trait | null
  onSave: (byStander: Trait) => void
}

export function ByStanderEditDialog({ open, onClose, byStander, onSave }: ByStanderEditDialogProps) {
  return (
    <EntityEditDialog
      open={open}
      onClose={onClose}
      entity={byStander}
      onSave={onSave}
      labels={{
        dialogTitle: byStander ? 'Edit Bystander' : 'Add Bystander',
        dialogDescription: 'Define the bystander and the special ability gained',
        titleLabel: 'Bystander Name',
        titlePlaceholder: 'e.g., MARY JANE',
        descriptionLabel: 'Ability Gained',
        descriptionPlaceholder: 'Describe the ability gained by devouring this bystander...',
        saveButton: 'Save Bystander',
      }}
    />
  )
}
