import { useEffect, useRef } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { useAudio } from './useAudio'

/**
 * Custom hook to manage timer functionality
 * Handles the interval, countdown, and completion sounds
 */
export function useTimer() {
  const {
    isPaused,
    elapsedSeconds,
    exercises,
    currentIndex,
    settings,
    tick,
    nextExercise,
    countdownSeconds,
  } = useRoutineStore()

  const { playBeep, playCompletionSound } = useAudio()
  const intervalRef = useRef<number | null>(null)
  const previousElapsedRef = useRef(0)

  const currentExercise = exercises[currentIndex]
  const duration = currentExercise?.duration || 0
  const remainingSeconds = duration - elapsedSeconds

  // Timer interval effect
  // IMPORTANT: Pause exercise timer when countdown is active
  useEffect(() => {
    const shouldRunTimer = !isPaused && currentExercise?.type === 'timed' && countdownSeconds === null

    if (shouldRunTimer) {
      intervalRef.current = window.setInterval(() => {
        tick()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, currentExercise, tick, countdownSeconds])

  // Beep sounds for countdown (C Mixolydian descending)
  // Don't play these beeps when countdown timer is active
  useEffect(() => {
    if (!settings.soundEnabled || isPaused || countdownSeconds !== null) return

    // Play beeps at 3, 2, 1 seconds remaining with Mixolydian frequencies
    if (remainingSeconds === 3) {
      playBeep(932.33, 0.15) // Bb5
    } else if (remainingSeconds === 2) {
      playBeep(659.25, 0.15) // E5
    } else if (remainingSeconds === 1) {
      playBeep(523.25, 0.15) // C5
    }
  }, [remainingSeconds, settings.soundEnabled, isPaused, playBeep, countdownSeconds])

  // Completion sound and auto-advance
  useEffect(() => {
    // Check if timer just completed (elapsed went from <duration to >=duration)
    const justCompleted =
      previousElapsedRef.current < duration &&
      elapsedSeconds >= duration &&
      duration > 0

    if (justCompleted) {
      if (settings.soundEnabled) {
        playCompletionSound()
      }

      // Auto-advance if enabled (after 1 second delay)
      if (settings.autoAdvanceEnabled) {
        setTimeout(() => {
          nextExercise(true) // Pass true to indicate this is an automatic advance
        }, 1000)
      }
    }

    previousElapsedRef.current = elapsedSeconds
  }, [elapsedSeconds, duration, settings.soundEnabled, settings.autoAdvanceEnabled, playCompletionSound, nextExercise])

  return {
    remainingSeconds,
    duration,
  }
}
