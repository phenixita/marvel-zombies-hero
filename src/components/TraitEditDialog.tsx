import { Trait } from "@/lib/Trait"
import { EntityEditDialog } from './EntityEditDialog'

interface TraitEditDialogProps {
  open: boolean
  onClose: () => void
  trait: Trait | null
  onSave: (trait: Trait) => void
}

export function TraitEditDialog({ open, onClose, trait, onSave }: TraitEditDialogProps) {
  return (
    <EntityEditDialog
      open={open}
      onClose={onClose}
      entity={trait}
      onSave={onSave}
      labels={{
        dialogTitle: trait ? 'Edit Trait' : 'Add Trait',
        dialogDescription: "Define the hero's special ability and its effects",
        titleLabel: 'Trait Name',
        titlePlaceholder: 'e.g., TELECINESI',
        descriptionLabel: 'Description',
        descriptionPlaceholder: "Describe the trait's effect...",
        saveButton: 'Save Trait',
      }}
    />
  )
}
