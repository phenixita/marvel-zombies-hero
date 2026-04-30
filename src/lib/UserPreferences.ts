export type ThemePreference = 'light' | 'dark' | 'system'

export interface UserPreferences {
  cloudSyncEnabled: boolean
  defaultAutomaticMode: boolean
  theme: ThemePreference
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  cloudSyncEnabled: true,
  defaultAutomaticMode: false,
  theme: 'system',
}
