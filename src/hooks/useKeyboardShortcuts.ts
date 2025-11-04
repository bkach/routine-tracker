import { useEffect } from 'react'
import { useRoutineStore } from '../store/routineStore'

/**
 * Custom hook for keyboard shortcuts
 * Space: Play/Pause
 * Arrow Left: Previous exercise
 * Arrow Right: Next exercise
 * Escape: Close modals
 */
export function useKeyboardShortcuts() {
  const {
    isPaused,
    timerStarted,
    settings,
    countdownSeconds,
    startTimer,
    pauseTimer,
    startCountdown,
    nextExercise,
    previousExercise,
    exercises,
    currentIndex,
    timelineOpen,
    editorOpen,
    settingsOpen,
    confirmModal,
    infoModal,
    setTimelineOpen,
    setEditorOpen,
    setSettingsOpen,
    hideConfirm,
    hideInfo,
  } = useRoutineStore()

  // Direct state setter for resuming countdown
  const resumeCountdown = () => {
    useRoutineStore.setState({ isPaused: false })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      const currentExercise = exercises[currentIndex]

      switch (event.key) {
        case ' ':
          event.preventDefault()
          if (currentExercise?.type === 'timed') {
            // If countdown is active and running, pause it
            if (countdownSeconds !== null && !isPaused) {
              pauseTimer()
              return
            }

            // If countdown is paused, resume it (just unpause, don't start main timer)
            if (countdownSeconds !== null && isPaused) {
              resumeCountdown()
              return
            }

            if (isPaused && !timerStarted && settings.countdownEnabled && !currentExercise.isRest) {
              // Start countdown from 3 (sounds will play in sync with countdown ticks)
              startCountdown(3)
            } else if (isPaused) {
              startTimer()
            } else {
              pauseTimer()
            }
          }
          break

        case 'ArrowLeft':
          event.preventDefault()
          previousExercise()
          break

        case 'ArrowRight':
          event.preventDefault()
          nextExercise()
          break

        case 'Escape':
          event.preventDefault()
          // Close modals in order of z-index (highest first: info/confirm at 10001, editor at 1000, settings, timeline at 999)
          if (infoModal.isOpen) {
            hideInfo()
          } else if (confirmModal.isOpen) {
            hideConfirm()
          } else if (editorOpen) {
            setEditorOpen(false)
          } else if (settingsOpen) {
            setSettingsOpen(false)
          } else if (timelineOpen) {
            setTimelineOpen(false)
          }
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    isPaused,
    timerStarted,
    settings,
    countdownSeconds,
    startTimer,
    pauseTimer,
    startCountdown,
    nextExercise,
    previousExercise,
    exercises,
    currentIndex,
    timelineOpen,
    editorOpen,
    settingsOpen,
    setTimelineOpen,
    setEditorOpen,
    setSettingsOpen,
  ])
}
