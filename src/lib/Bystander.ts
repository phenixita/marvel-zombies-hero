export type BystanderSource = 'preset' | 'custom'

export interface Bystander {
  id: string
  title: string
  description: string
  source: BystanderSource
  templateId?: string
}
