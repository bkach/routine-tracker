import type { Settings } from '../types'

const STORAGE_KEYS = {
  speechEnabled: 'speechEnabled',
  timerSoundEnabled: 'timerSoundEnabled',
  halfwayChimeEnabled: 'halfwayChimeEnabled',
  autoAdvanceEnabled: 'autoAdvanceEnabled',
} as const

/**
 * Load settings from localStorage
 */
export function loadSettings(): Settings {
  const storedTimerSound = localStorage.getItem(STORAGE_KEYS.timerSoundEnabled)
  const legacyCountdown = localStorage.getItem('countdownEnabled')
  const legacySoundEnabled = localStorage.getItem('soundEnabled')
  const legacyCountdownSound = localStorage.getItem('countdownSoundEnabled')

  return {
    speechEnabled: localStorage.getItem(STORAGE_KEYS.speechEnabled) === 'true',
    timerSoundEnabled:
      storedTimerSound !== null
        ? storedTimerSound === 'true'
        : legacyCountdownSound !== null
          ? legacyCountdownSound === 'true'
          : legacySoundEnabled === 'true' || legacyCountdown === 'true',
    halfwayChimeEnabled: localStorage.getItem(STORAGE_KEYS.halfwayChimeEnabled) === 'true',
    autoAdvanceEnabled: localStorage.getItem(STORAGE_KEYS.autoAdvanceEnabled) === 'true',
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.speechEnabled, String(settings.speechEnabled))
  localStorage.setItem(STORAGE_KEYS.timerSoundEnabled, String(settings.timerSoundEnabled))
  localStorage.setItem(STORAGE_KEYS.halfwayChimeEnabled, String(settings.halfwayChimeEnabled))
  localStorage.setItem(STORAGE_KEYS.autoAdvanceEnabled, String(settings.autoAdvanceEnabled))
}

/**
 * Update specific setting
 */
export function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  localStorage.setItem(STORAGE_KEYS[key], String(value))
}
