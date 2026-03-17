import { formatTime } from '../utils/exercises'
import { useRoutineStore } from '../store/routineStore'

interface TimerProps {
  elapsedSeconds: number
  duration: number
  isRest?: boolean
}

export function Timer({ elapsedSeconds, duration, isRest }: TimerProps) {
  const { isPaused, timerStarted, settings } = useRoutineStore()
  const elapsed = formatTime(elapsedSeconds)
  const total = formatTime(duration)
  const remainingSeconds = duration - elapsedSeconds

  const showEndCountdown =
    settings.endCountdownEnabled &&
    timerStarted &&
    !isPaused &&
    remainingSeconds > 0 &&
    remainingSeconds <= 3

  const displayText = showEndCountdown ? String(remainingSeconds) : `${elapsed} / ${total}`

  return (
    <div className={`timer-display ${isRest ? 'rest' : ''}`} id="timerContainer">
      <div className="timer-label" id="timerLabel">Time</div>
      <div className="timer-time" id="timerDisplay">{displayText}</div>
    </div>
  )
}
