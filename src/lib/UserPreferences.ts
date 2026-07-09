export type ThemePreference = 'light' | 'dark' | 'system'

export type BackgroundMode = 'default' | 'device' | 'random'

export interface UserPreferences {
  cloudSyncEnabled: boolean
  defaultAutomaticMode: boolean
  theme: ThemePreference
  backgroundMode: BackgroundMode
  backgroundImage?: string
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  cloudSyncEnabled: true,
  defaultAutomaticMode: false,
  theme: 'system',
  backgroundMode: 'default',
  backgroundImage: undefined,
}
