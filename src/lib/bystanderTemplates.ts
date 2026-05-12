import { Bystander } from './Bystander'

export interface BystanderTemplate {
  id: string
  title: string
  description: string
}

export const BYSTANDER_TEMPLATES: BystanderTemplate[] = [
  {
    id: 'aunt-may',
    title: 'AUNT MAY',
    description: 'When you would take a Wound, you may cancel it once this turn.',
  },
  {
    id: 'mary-jane',
    title: 'MARY JANE',
    description: 'Gain +1 die on your next Attack this turn.',
  },
  {
    id: 'wong',
    title: 'WONG',
    description: 'After you Devour, recover 1 Health.',
  },
  {
    id: 'phil-coulson',
    title: 'PHIL COULSON',
    description: 'Draw 1 extra target option whenever you Attack.',
  },
  {
    id: 'foggy-nelson',
    title: 'FOGGY NELSON',
    description: 'You may reroll 1 die during an Attack.',
  },
  {
    id: 'peggy-carter',
    title: 'PEGGY CARTER',
    description: 'At the start of your turn, gain 1 temporary action this turn only.',
  },
]

export function toPresetBystander(template: BystanderTemplate): Bystander {
  return {
    id: crypto.randomUUID(),
    title: template.title,
    description: template.description,
    source: 'preset',
    templateId: template.id,
  }
}

export function getBystanderTemplateById(templateId?: string): BystanderTemplate | undefined {
  if (!templateId) return undefined
  return BYSTANDER_TEMPLATES.find((template) => template.id === templateId)
}
