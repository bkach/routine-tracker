// Exercise types
export type ExerciseType = 'timed' | 'reps'

export interface BaseExercise {
  section: string
  name: string
  type: ExerciseType
  sets: number
  instructions?: string
  feel?: string
  restBetweenSets?: number
  restAfterExercise?: number
}

export interface TimedExercise extends BaseExercise {
  type: 'timed'
  duration: number
}

export interface RepsExercise extends BaseExercise {
  type: 'reps'
  reps: string
}

export type Exercise = TimedExercise | RepsExercise

// Expanded exercise (one per set, with rest periods injected)
export interface ExpandedExercise {
  section: string
  name: string
  type: ExerciseType
  setNumber?: number
  totalSets?: number
  duration?: number
  reps?: string
  instructions?: string
  feel?: string
  isRest?: boolean
  isInjectedRest?: boolean
  restDuration?: number
}

// Routine configuration
export interface RoutineConfig {
  title: string
  subtitle: string
  exercises: Exercise[]
}

// Settings
export interface Settings {
  soundEnabled: boolean
  countdownEnabled: boolean
  autoAdvanceEnabled: boolean
}

// Store state
export interface RoutineState {
  // Configuration
  config: RoutineConfig | null
  exercises: ExpandedExercise[]
  originalYaml: string
  currentYaml: string

  // Current exercise
  currentIndex: number

  // Timer state
  elapsedSeconds: number
  isPaused: boolean
  timerStarted: boolean
  currentDuration: number
  countdownSeconds: number | null

  // Settings
  settings: Settings

  // UI state
  timelineOpen: boolean
  editorOpen: boolean
  settingsOpen: boolean
  confirmModal: {
    isOpen: boolean
    title: string
    message: string
    onConfirm: (() => void) | null
  }
  infoModal: {
    isOpen: boolean
    title: string
    messageHtml: string
  }

  // Loading/error
  isLoading: boolean
  error: string | null

  // Session
  sessionStartTime: number
}

// Actions
export interface RoutineActions {
  // Configuration
  loadConfig: () => Promise<void>
  updateConfig: (yaml: string) => Promise<void>
  resetToDefault: () => Promise<void>

  // Navigation
  nextExercise: (isAutoAdvance?: boolean) => void
  previousExercise: () => void
  goToExercise: (index: number) => void

  // Timer
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void

  // Settings
  updateSettings: (settings: Partial<Settings>) => void

  // UI
  setTimelineOpen: (open: boolean) => void
  setEditorOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  showConfirm: (title: string, message: string, onConfirm: () => void) => void
  hideConfirm: () => void
  showInfo: (title: string, messageHtml: string) => void
  hideInfo: () => void

  // Countdown
  startCountdown: (seconds: number) => void
  tickCountdown: () => void
}

// Complete store type
export type RoutineStore = RoutineState & RoutineActions
