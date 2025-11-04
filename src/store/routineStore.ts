import { create } from 'zustand'
import type { RoutineStore } from '../types'
import { loadYamlConfig, saveYamlConfig, clearCustomConfig } from '../utils/yaml'
import { expandExercises } from '../utils/exercises'
import { loadSettings, saveSettings } from '../utils/settings'

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  // Initial state
  config: null,
  exercises: [],
  originalYaml: '',
  currentYaml: '',
  currentIndex: 0,
  elapsedSeconds: 0,
  isPaused: true,
  timerStarted: false,
  currentDuration: 0,
  countdownSeconds: null,
  settings: loadSettings(),
  timelineOpen: false,
  editorOpen: false,
  settingsOpen: false,
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  },
  infoModal: {
    isOpen: false,
    title: '',
    messageHtml: '',
  },
  isLoading: false,
  error: null,
  sessionStartTime: Date.now(),

  // Configuration actions
  loadConfig: async () => {
    set({ isLoading: true, error: null })

    try {
      const { yaml: yamlText, config } = await loadYamlConfig()
      const exercises = expandExercises(config.exercises)

      set({
        config,
        exercises,
        originalYaml: yamlText,
        currentYaml: yamlText,
        isLoading: false,
        currentIndex: 0,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
        sessionStartTime: Date.now(),
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load configuration',
      })
    }
  },

  updateConfig: async (yaml: string) => {
    try {
      const yamlModule = await import('js-yaml')
      const config = yamlModule.load(yaml)

      if (!config) {
        throw new Error('Invalid YAML configuration')
      }

      const exercises = expandExercises((config as any).exercises)

      // Save to localStorage
      saveYamlConfig(yaml)

      set({
        config: config as any,
        exercises,
        currentYaml: yaml,
        currentIndex: 0,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
        error: null,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update configuration',
      })
      throw error
    }
  },

  resetToDefault: async () => {
    clearCustomConfig()
    await get().loadConfig()
  },

  // Navigation actions
  nextExercise: (isAutoAdvance = false) => {
    const { currentIndex, exercises, settings } = get()

    if (currentIndex < exercises.length - 1) {
      const nextIndex = currentIndex + 1
      const nextExercise = exercises[nextIndex]

      set({
        currentIndex: nextIndex,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
        countdownSeconds: null,
      })

      // Auto-start timer ONLY if this is an automatic advance (not manual navigation)
      if (isAutoAdvance && settings.autoAdvanceEnabled && nextExercise.type === 'timed') {
        setTimeout(() => {
          // If countdown is enabled and not a rest exercise, start countdown first
          if (settings.countdownEnabled && !nextExercise.isRest) {
            get().startCountdown(3)
          } else {
            // Otherwise start timer directly
            set({
              timerStarted: true,
              isPaused: false,
            })
          }
        }, 100)
      }
    } else {
      // Reached the end - show completion view
      set({
        currentIndex: exercises.length,
        isPaused: true,
        timerStarted: false,
        countdownSeconds: null,
      })
    }
  },

  previousExercise: () => {
    const { currentIndex } = get()

    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
        countdownSeconds: null,
      })
    }
  },

  goToExercise: (index: number) => {
    const { exercises } = get()

    if (index >= 0 && index < exercises.length) {
      set({
        currentIndex: index,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
        countdownSeconds: null,
      })
    }
  },

  // Timer actions
  startTimer: () => {
    set({
      isPaused: false,
      timerStarted: true,
      countdownSeconds: null, // Clear any countdown
    })
  },

  pauseTimer: () => {
    set({
      isPaused: true,
    })
  },

  resetTimer: () => {
    set({
      elapsedSeconds: 0,
      isPaused: true,
      timerStarted: false,
      countdownSeconds: null,
    })
  },

  tick: () => {
    const { isPaused, elapsedSeconds, exercises, currentIndex } = get()

    if (isPaused) return

    const currentExercise = exercises[currentIndex]
    const duration = currentExercise?.duration || 0

    // Note: Sound playback is handled in useTimer hook to access useAudio
    // This just updates the elapsed seconds

    if (elapsedSeconds >= duration) {
      // Timer completed - handled in useTimer hook
      set({ isPaused: true })
    } else {
      set({ elapsedSeconds: elapsedSeconds + 1 })
    }
  },

  // Countdown actions
  startCountdown: (initialSeconds: number) => {
    set({
      countdownSeconds: initialSeconds,
      isPaused: false,
    })
  },

  tickCountdown: () => {
    const { countdownSeconds, isPaused } = get()

    if (isPaused || countdownSeconds === null) return

    if (countdownSeconds <= 1) {
      // Countdown finished, start main timer from 0:00 (transition from 1 directly to timer)
      set({
        countdownSeconds: null,
        timerStarted: true,
        isPaused: false,
        elapsedSeconds: 0,
      })
    } else {
      set({ countdownSeconds: countdownSeconds - 1 })
    }
  },

  // Settings actions
  updateSettings: (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings }
    saveSettings(updatedSettings)
    set({ settings: updatedSettings })
  },

  // UI actions
  setTimelineOpen: (open) => {
    set({ timelineOpen: open })
  },

  setEditorOpen: (open) => {
    set({ editorOpen: open })
  },

  setSettingsOpen: (open) => {
    set({ settingsOpen: open })
  },

  // Modal actions
  showConfirm: (title, message, onConfirm) => {
    set({
      confirmModal: {
        isOpen: true,
        title,
        message,
        onConfirm,
      },
    })
  },

  hideConfirm: () => {
    set({
      confirmModal: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      },
    })
  },

  showInfo: (title, messageHtml) => {
    set({
      infoModal: {
        isOpen: true,
        title,
        messageHtml,
      },
    })
  },

  hideInfo: () => {
    set({
      infoModal: {
        isOpen: false,
        title: '',
        messageHtml: '',
      },
    })
  },
}))
