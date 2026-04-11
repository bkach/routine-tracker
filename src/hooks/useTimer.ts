import { useEffect, useRef } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { useAudio } from './useAudio'
import { END_COUNTDOWN_FREQUENCIES } from '../utils/sound'

/**
 * Custom hook to manage timer functionality
 * Handles the interval, warning beeps, and completion sounds
 */
export function useTimer() {
  const {
    isPaused,
    timerStarted,
    elapsedSeconds,
    exercises,
    currentIndex,
    settings,
    tick,
    nextExercise,
  } = useRoutineStore()

  const { playBeep, playCompletionSound } = useAudio()
  const intervalRef = useRef<number | null>(null)
  const autoAdvanceTimeoutRef = useRef<number | null>(null)
  const previousElapsedRef = useRef(0)
  const halfwayChimedRef = useRef(false)

  const currentExercise = exercises[currentIndex]
  const duration = currentExercise?.duration || 0
  const remainingSeconds = duration - elapsedSeconds

  // Timer interval effect
  useEffect(() => {
    const shouldRunTimer = !isPaused && currentExercise?.type === 'timed'

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
  }, [isPaused, currentExercise, tick])

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        clearTimeout(autoAdvanceTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    halfwayChimedRef.current = false
  }, [currentIndex, timerStarted])

  useEffect(() => {
    if (!settings.timerSoundEnabled || !settings.halfwayChimeEnabled || isPaused) return
    if (currentExercise?.type !== 'timed' || !duration) return

    const halfwayPoint = Math.floor(duration / 2)
    if (halfwayPoint <= 0 || halfwayChimedRef.current) return

    if (elapsedSeconds >= halfwayPoint) {
      playBeep(1000, 0.2)
      halfwayChimedRef.current = true
    }
  }, [
    elapsedSeconds,
    duration,
    currentExercise,
    isPaused,
    settings.timerSoundEnabled,
    settings.halfwayChimeEnabled,
    playBeep,
  ])

  // Play 3-2-1 warning tones at the end of the timer.
  useEffect(() => {
    if (!settings.timerSoundEnabled || isPaused) return

    // Reuse the former pre-start countdown tones for the end-of-timer warning.
    if (remainingSeconds === 3) {
      playBeep(END_COUNTDOWN_FREQUENCIES[0], 0.15)
    } else if (remainingSeconds === 2) {
      playBeep(END_COUNTDOWN_FREQUENCIES[1], 0.15)
    } else if (remainingSeconds === 1) {
      playBeep(END_COUNTDOWN_FREQUENCIES[2], 0.15)
    }
  }, [remainingSeconds, settings.timerSoundEnabled, isPaused, playBeep])

  // Completion sound and auto-advance
  useEffect(() => {
    // Check if timer just completed (elapsed went from <duration to >=duration)
    const justCompleted =
      previousElapsedRef.current < duration &&
      elapsedSeconds >= duration &&
      duration > 0

    if (justCompleted) {
      if (settings.timerSoundEnabled) {
        playCompletionSound()
      }

      // Auto-advance if enabled (after 1 second delay)
      if (settings.autoAdvanceEnabled) {
        const completedIndex = currentIndex
        if (autoAdvanceTimeoutRef.current !== null) {
          clearTimeout(autoAdvanceTimeoutRef.current)
        }
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          if (useRoutineStore.getState().currentIndex === completedIndex) {
            nextExercise(true)
          }
        }, 1000)
      }
    }

    if (autoAdvanceTimeoutRef.current !== null && elapsedSeconds < duration) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }

    previousElapsedRef.current = elapsedSeconds
  }, [
    elapsedSeconds,
    duration,
    currentIndex,
    settings.timerSoundEnabled,
    settings.autoAdvanceEnabled,
    playCompletionSound,
    nextExercise,
  ])

  return {
    remainingSeconds,
    duration,
  }
}
