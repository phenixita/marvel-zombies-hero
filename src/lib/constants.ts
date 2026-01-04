/**
 * Game constants for Marvel Zombies Hero Tracker
 */

// Health and Hunger bounds
export const MIN_HEALTH = 0
export const MAX_HEALTH = 5
export const MIN_HUNGER = 0
export const MAX_HUNGER = 4

// Hero level thresholds and colors
export const LEVEL_THRESHOLDS = {
  BLUE: { max: 6, color: 'bg-blue-500', category: 'Blue' },
  YELLOW: { max: 18, color: 'bg-yellow-500', category: 'Yellow' },
  ORANGE: { max: 42, color: 'bg-orange-500', category: 'Orange' },
  RED: { max: Infinity, color: 'bg-red-500', category: 'Red' },
} as const

// Turn action counts
export const BASE_ACTIONS = 3
export const LEVEL_7_ACTIONS = 4
export const LEVEL_7_THRESHOLD = 7
