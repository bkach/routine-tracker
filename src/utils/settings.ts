import type { Settings } from '../types'

const STORAGE_KEYS = {
  soundEnabled: 'soundEnabled',
  countdownEnabled: 'countdownEnabled',
  autoAdvanceEnabled: 'autoAdvanceEnabled',
} as const

/**
 * Load settings from localStorage
 */
export function loadSettings(): Settings {
  return {
    soundEnabled: localStorage.getItem(STORAGE_KEYS.soundEnabled) === 'true',
    countdownEnabled: localStorage.getItem(STORAGE_KEYS.countdownEnabled) === 'true',
    autoAdvanceEnabled: localStorage.getItem(STORAGE_KEYS.autoAdvanceEnabled) === 'true',
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.soundEnabled, String(settings.soundEnabled))
  localStorage.setItem(STORAGE_KEYS.countdownEnabled, String(settings.countdownEnabled))
  localStorage.setItem(STORAGE_KEYS.autoAdvanceEnabled, String(settings.autoAdvanceEnabled))
}

/**
 * Update specific setting
 */
export function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  localStorage.setItem(STORAGE_KEYS[key], String(value))
}
