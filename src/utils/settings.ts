import type { Settings } from '../types'

const STORAGE_KEYS = {
  soundEnabled: 'soundEnabled',
  endCountdownEnabled: 'endCountdownEnabled',
  autoAdvanceEnabled: 'autoAdvanceEnabled',
} as const

/**
 * Load settings from localStorage
 */
export function loadSettings(): Settings {
  const storedEndCountdown = localStorage.getItem(STORAGE_KEYS.endCountdownEnabled)
  const legacyCountdown = localStorage.getItem('countdownEnabled')

  return {
    soundEnabled: localStorage.getItem(STORAGE_KEYS.soundEnabled) === 'true',
    endCountdownEnabled: storedEndCountdown !== null ? storedEndCountdown === 'true' : legacyCountdown === 'true',
    autoAdvanceEnabled: localStorage.getItem(STORAGE_KEYS.autoAdvanceEnabled) === 'true',
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.soundEnabled, String(settings.soundEnabled))
  localStorage.setItem(STORAGE_KEYS.endCountdownEnabled, String(settings.endCountdownEnabled))
  localStorage.setItem(STORAGE_KEYS.autoAdvanceEnabled, String(settings.autoAdvanceEnabled))
}

/**
 * Update specific setting
 */
export function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  localStorage.setItem(STORAGE_KEYS[key], String(value))
}
