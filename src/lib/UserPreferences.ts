export interface UserPreferences {
  cloudSyncEnabled: boolean
  defaultAutomaticMode: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  cloudSyncEnabled: true,
  defaultAutomaticMode: false,
}
