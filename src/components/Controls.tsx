import { useEffect, useRef } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { useAudio } from '../hooks/useAudio'

export function Controls() {
  const {
    isPaused,
    timerStarted,
    currentIndex,
    exercises,
    settings,
    countdownSeconds,
    startTimer,
    pauseTimer,
    resetTimer,
    nextExercise,
    previousExercise,
    startCountdown,
    tickCountdown,
  } = useRoutineStore()

  // Direct state setter for resuming countdown
  const resumeCountdown = () => {
    useRoutineStore.setState({ isPaused: false })
  }

  const { playBeep, playArpeggio } = useAudio()
  const countdownIntervalRef = useRef<number | null>(null)
  const previousCountdownRef = useRef<number | null>(null)
  const previousCountdownForBeepRef = useRef<number | null>(null)

  // Play countdown beeps in sync with countdown display (only when countdown decreases)
  useEffect(() => {
    if (countdownSeconds === null || isPaused || !settings.soundEnabled) {
      previousCountdownForBeepRef.current = countdownSeconds
      return
    }

    // Only play sound if countdown actually decreased (not on pause/resume)
    const countdownDecreased = previousCountdownForBeepRef.current !== null &&
                                countdownSeconds < previousCountdownForBeepRef.current

    if (countdownDecreased || previousCountdownForBeepRef.current === null) {
      // Play beep for current countdown number (C major arpeggio ascending)
      if (countdownSeconds === 3) {
        playBeep(523.25, 0.15) // C5
      } else if (countdownSeconds === 2) {
        playBeep(659.25, 0.15) // E5
      } else if (countdownSeconds === 1) {
        playBeep(783.99, 0.15) // G5
      }
    }

    previousCountdownForBeepRef.current = countdownSeconds
  }, [countdownSeconds, isPaused, settings.soundEnabled, playBeep])

  // Play "GO" arpeggio when countdown finishes
  useEffect(() => {
    const justFinished = previousCountdownRef.current !== null && countdownSeconds === null && timerStarted
    if (justFinished && settings.soundEnabled) {
      playArpeggio()
    }
    previousCountdownRef.current = countdownSeconds
  }, [countdownSeconds, timerStarted, settings.soundEnabled, playArpeggio])

  // Manage countdown interval
  useEffect(() => {
    if (countdownSeconds !== null && !isPaused) {
      // Start countdown interval
      countdownIntervalRef.current = window.setInterval(() => {
        tickCountdown()
      }, 1000)
    } else {
      // Clear interval when countdown finishes or is paused
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }

    return () => {
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [countdownSeconds, isPaused, tickCountdown])

  const currentExercise = exercises[currentIndex]
  const isTimedExercise = currentExercise?.type === 'timed'

  const handlePlayPause = () => {
    if (!isTimedExercise) return

    // If countdown is active and running, pause it
    if (countdownSeconds !== null && !isPaused) {
      pauseTimer()
      return
    }

    // If countdown is paused, resume it (just unpause, don't start main timer)
    if (countdownSeconds !== null && isPaused) {
      resumeCountdown() // Just unpause to resume the countdown interval
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

  // Button shows pause icon when countdown is running OR when timer is running
  const isRunning = (countdownSeconds !== null && !isPaused) || (timerStarted && !isPaused)
  const pauseBtnText = isRunning ? '⏸' : '▶'

  return (
    <div className="controls">
      <div className="all-controls">
        <button
          className="btn btn-secondary"
          id="prevBtn"
          onClick={previousExercise}
          disabled={currentIndex === 0}
          title="Previous"
        >
          ←
        </button>
        {isTimedExercise && (
          <>
            <button
              className="btn btn-tertiary"
              id="resetBtn"
              onClick={resetTimer}
              title="Reset"
            >
              🔄
            </button>
            <button
              className="btn btn-tertiary"
              id="pauseBtn"
              onClick={handlePlayPause}
              title="Start/Pause"
            >
              {pauseBtnText}
            </button>
          </>
        )}
        <button
          className="btn btn-primary"
          id="nextBtn"
          onClick={() => nextExercise()}
          title="Next"
        >
          →
        </button>
      </div>
    </div>
  )
}
