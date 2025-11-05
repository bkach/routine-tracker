import { create } from 'zustand'
import type { RoutineStore, RoutineId } from '../types'
import {
  loadRoutineLibrary,
  saveRoutineLibrary,
  getActiveRoutineId,
  setActiveRoutineId,
  saveRoutineToLibrary as saveRoutineToLib,
  deleteRoutineFromLibrary,
  getRoutineById,
  routineToYaml,
  generateRoutineId
} from '../utils/yaml'
import { expandExercises } from '../utils/exercises'
import { loadSettings, saveSettings } from '../utils/settings'
import * as yaml from 'js-yaml'

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  // Initial state
  routineLibrary: {},
  activeRoutineId: null,
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

  // Routine library management actions
  loadRoutineLibrary: async () => {
    set({ isLoading: true, error: null })

    try {
      // Check for URL import first (now async)
      const { checkAndImportFromURL } = await import('../utils/yaml')
      const imported = await checkAndImportFromURL()

      let library = loadRoutineLibrary()
      let activeId = getActiveRoutineId()

      // If we imported from URL, switch to it and show toast
      if (imported) {
        activeId = imported.id
        setActiveRoutineId(activeId)

        // Show toast notification after a brief delay to ensure DOM is ready
        setTimeout(async () => {
          const { showToast } = await import('../utils/toast')
          showToast(`"${imported.name}" added to your routines`)
        }, 100)
      }

      // If library is empty, load starter templates
      if (Object.keys(library).length === 0) {
        // Load all three starter routines
        const starterRoutines = [
          { file: 'routine.yml', name: 'Ankle Routine' },
          { file: 'morning-mobility.yml', name: 'Morning Mobility' },
          { file: 'strength-workout.yml', name: 'Strength Workout' }
        ]

        for (const starter of starterRoutines) {
          try {
            const response = await fetch(`${import.meta.env.BASE_URL}${starter.file}`)
            if (response.ok) {
              const yamlText = await response.text()
              const config = yaml.load(yamlText) as any
              const id = generateRoutineId()

              library[id] = {
                id,
                name: starter.name,
                yaml: yamlText, // Preserve raw YAML with comments
                ...config
              }

              // Set first routine as active
              if (!activeId) {
                activeId = id
              }
            }
          } catch (error) {
            console.error(`Failed to load ${starter.file}:`, error)
          }
        }

        if (Object.keys(library).length > 0) {
          saveRoutineLibrary(library)
          if (activeId) {
            setActiveRoutineId(activeId)
          }
        }
      }

      // Ensure we have an active routine
      if (!activeId && Object.keys(library).length > 0) {
        activeId = Object.keys(library)[0]
        setActiveRoutineId(activeId)
      }

      set({
        routineLibrary: library,
        activeRoutineId: activeId,
        isLoading: false
      })

      // Load the active routine
      if (activeId) {
        await get().selectRoutine(activeId)
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load routine library'
      })
    }
  },

  selectRoutine: async (id: RoutineId) => {
    try {
      const routine = getRoutineById(id)
      if (!routine) {
        throw new Error(`Routine not found: ${id}`)
      }

      const yamlText = routineToYaml(routine)
      const exercises = expandExercises(routine.exercises)

      set({
        activeRoutineId: id,
        config: routine,
        exercises,
        originalYaml: yamlText,
        currentYaml: yamlText,
        currentIndex: 0,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
        sessionStartTime: Date.now(),
        error: null
      })

      setActiveRoutineId(id)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to select routine'
      })
      throw error
    }
  },

  createNewRoutine: async (name: string, yamlText: string) => {
    try {
      const id = generateRoutineId()
      saveRoutineToLib(id, name, yamlText)

      // Reload library
      const library = loadRoutineLibrary()
      set({ routineLibrary: library })

      return id
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create routine'
      })
      throw error
    }
  },

  deleteRoutine: (id: RoutineId) => {
    try {
      deleteRoutineFromLibrary(id)

      // Reload library
      const library = loadRoutineLibrary()
      set({ routineLibrary: library })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete routine'
      })
      throw error
    }
  },

  saveRoutineToLibrary: async (id: RoutineId, name: string, yamlText: string) => {
    try {
      saveRoutineToLib(id, name, yamlText)

      // Reload library
      const library = loadRoutineLibrary()
      set({ routineLibrary: library })

      // If this is the active routine, reload it
      if (get().activeRoutineId === id) {
        await get().selectRoutine(id)
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save routine'
      })
      throw error
    }
  },

  // Configuration actions (reloads active routine)
  loadConfig: async () => {
    const { activeRoutineId } = get()
    if (activeRoutineId) {
      await get().selectRoutine(activeRoutineId)
    }
  },

  updateConfig: async (yamlText: string) => {
    try {
      const config = yaml.load(yamlText) as any

      if (!config) {
        throw new Error('Invalid YAML configuration')
      }

      const exercises = expandExercises(config.exercises)

      // If we have an active routine, update it in the library
      // Use the title from the YAML as the routine name
      const { activeRoutineId } = get()
      if (activeRoutineId) {
        const name = config.title || 'Untitled Routine'
        await get().saveRoutineToLibrary(activeRoutineId, name, yamlText)
      }

      set({
        config: config,
        exercises,
        currentYaml: yamlText,
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
    // Reset to a simple template with instructions
    const simpleTemplate = `title: New Routine
subtitle: Custom Routine
exercises:
  # Timed Exercise Example
  - section: Warm-up
    name: Sample Timed Exercise
    type: timed              # Use "timed" for duration-based exercises
    sets: 3
    duration: 30             # Duration in seconds
    instructions: Replace with your exercise
    feel: Optional cue about what to focus on
    restBetweenSets: 15      # Optional: rest between each set (in seconds)
    restAfterExercise: 60    # Optional: rest after all sets complete

  # Reps Exercise Example
  - section: Main Work
    name: Sample Reps Exercise
    type: reps               # Use "reps" for rep-based exercises
    sets: 3
    reps: "10-12 reps"       # Can be "10 reps", "10 each side", etc.
    instructions: Replace with your exercise
    restBetweenSets: 45      # Optional: creates separate cards for each set
    restAfterExercise: 90

  # Quick Reference:
  # - Each exercise must have: section, name, type, sets
  # - Timed exercises need: duration (in seconds)
  # - Reps exercises need: reps (as text, in quotes)
  # - Optional fields: instructions, feel, restBetweenSets, restAfterExercise
  # - Delete these example exercises and add your own!
`
    try {
      const { activeRoutineId } = get()
      if (activeRoutineId) {
        const routine = getRoutineById(activeRoutineId)
        if (routine) {
          await get().saveRoutineToLibrary(activeRoutineId, routine.name, simpleTemplate)
        }
      }
    } catch (error) {
      console.error('Failed to reset:', error)
    }
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
